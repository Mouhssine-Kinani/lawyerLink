from fastapi import APIRouter, Depends, HTTPException, Query 
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.security import hash_password
from app.user.model import User, Client, Role
from app.lawyer.model import Lawyer
from app.reservation.model import Reservation, ReservationStatus
from app.reservation.schema import ReservationAdminResponse
from app.review.model import Review
from app.payment.model import Subscription, SubscriptionStatus, BoostPayment
from app.admin.schema import (
    CreateUserRequest, UpdateUserRequest, 
    AdminUserResponse, AdminLawyerResponse, AdminClientResponse,
    DashboardStats, DashboardCharts, MonthlyDataPoint,
    PaginatedClients, PaginatedLawyers
)

router = APIRouter(prefix="/admin",tags=["Admin"])
admin_required = Depends(require_role("admin"))

# ──────────────────────────────────────────────────────────────
# DASHBOARD STATS
# ──────────────────────────────────────────────────────────────
@router.get("/dashboard",response_model=DashboardStats)
def get_dashboard_stats(current_user:User = Depends(require_role("admin")) ,db:Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_clients = db.query(Client).count()
    total_lawyers = db.query(Lawyer).count()

    total_reservations = db.query(Reservation).count()
    pending_reservations = db.query(Reservation).filter(Reservation.status == ReservationStatus.pending).count()
    completed_reservations = db.query(Reservation).filter(Reservation.status == ReservationStatus.completed).count()

    total_reviews = db.query(Review).count()
    average_rating_result = db.query(func.avg(Lawyer.rating_avg)).filter(Lawyer.rating_count > 0).first()
    avg_rating = float(average_rating_result[0]) if average_rating_result[0] else None

    from sqlalchemy import case as sql_case

    subscription_revenue = db.query(
        func.sum(
            sql_case(
                (Subscription.plan_type == "pro", 299),
                (Subscription.plan_type == "elite", 499),
                else_=0
            )
        )
    ).filter(
        Subscription.status.in_([SubscriptionStatus.active, SubscriptionStatus.cancelled])
    ).scalar() or 0

    boost_revenue = db.query(
        func.sum(
            sql_case(
                (BoostPayment.boost_level == 1, 149),
                (BoostPayment.boost_level == 2, 269),
                (BoostPayment.boost_level == 3, 499),
                else_=0
            )
        )
    ).scalar() or 0

    total_revenue = float(subscription_revenue) + float(boost_revenue)

    return DashboardStats(
        total_users = total_users,
        total_clients = total_clients,
        total_lawyers = total_lawyers,
        total_reservations = total_reservations,
        pending_reservations = pending_reservations,
        completed_reservations = completed_reservations,
        total_reviews = total_reviews,
        avg_rating = avg_rating,
        total_subscription_revenue = float(subscription_revenue),
        total_boost_revenue = float(boost_revenue),
        total_revenue = total_revenue
    )

@router.get("/dashboard/charts", response_model=DashboardCharts)
def get_dashboard_charts(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    from sqlalchemy import extract, case as sql_case

    sub_rev = db.query(
        func.concat(extract('year', Subscription.start_date), '-', func.lpad(extract('month', Subscription.start_date), 2, '0')).label('month'),
        func.sum(
            sql_case(
                (Subscription.plan_type == "pro", 299),
                (Subscription.plan_type == "elite", 499),
                else_=0
            )
        ).label('value')
    ).filter(
        Subscription.status.in_([SubscriptionStatus.active, SubscriptionStatus.cancelled])
    ).group_by('month').order_by('month').all()

    boost_rev = db.query(
        func.concat(extract('year', BoostPayment.starts_at), '-', func.lpad(extract('month', BoostPayment.starts_at), 2, '0')).label('month'),
        func.sum(
            sql_case(
                (BoostPayment.boost_level == 1, 149),
                (BoostPayment.boost_level == 2, 269),
                (BoostPayment.boost_level == 3, 499),
                else_=0
            )
        ).label('value')
    ).group_by('month').order_by('month').all()

    reservations = db.query(
        func.concat(extract('year', Reservation.created_at), '-', func.lpad(extract('month', Reservation.created_at), 2, '0')).label('month'),
        func.count(Reservation.id).label('value')
    ).group_by('month').order_by('month').all()

    return DashboardCharts(
        subscription_revenue=[MonthlyDataPoint(month=r.month, value=float(r.value)) for r in sub_rev],
        boost_revenue=[MonthlyDataPoint(month=r.month, value=float(r.value)) for r in boost_rev],
        reservations=[MonthlyDataPoint(month=r.month, value=float(r.value)) for r in reservations],
    )

# ──────────────────────────────────────────────────────────────
# USER MANAGEMENT
# ──────────────────────────────────────────────────────────────

@router.get("/users",response_model=List[AdminUserResponse])
def get_all_users(current_user:User = Depends(require_role("admin")),
                    role:Optional[str] = Query(None,description= "filter by roles:admin,client,lawyer"),
                    limit:int = Query(50,ge=1,le=100),
                    is_active:Optional[bool] = Query(None,description = "filter by active students"),
                    db:Session = Depends(get_db)):
    query = db.query(User)
    if role:
        if role not in ["admin","client","lawyer"]:
            raise HTTPException(403,f"invalid role: {role}. must be admin,client or lawyer")
        query = db.query(User).filter(User.role == role)

    users = query.order_by(User.created_at.desc()).limit(limit).all()
    return users

@router.get("/users/{user_id}",response_model=AdminUserResponse)
def get_user_by_id(user_id:int,current_user:User = Depends(require_role("admin")),db:Session = Depends(get_db)):
    user_exist = db.query(User).filter(User.id == user_id).first()
    if not user_exist:
        raise HTTPException(404,f"User with ID {user_id} not found")
    return user_exist 

@router.post("/users",status_code=201)
def create_user(data:CreateUserRequest,current_user:User = Depends(require_role("admin")),db:Session = Depends(get_db)):
    if data.role == "admin":
        raise HTTPException(403,"Cannot create admin accounts through this endpoint")
    
    users = db.query(User).filter(User.email == data.email).first()
    if users:
        raise HTTPException(404,f"User with ID {current_user.id} already exist")
    user = User(
        email = data.email,
        password_hash = hash_password(data.password),
        role = Role(data.role),
    )
    db.add(user)
    db.flush()
    # add based in roles
    if data.role == "client":
        client = Client(
            user_id = user.id,
            first_name=data.first_name or "",
            last_name=data.last_name or "",
            phone=data.phone or ""
        )
        db.add(client)
    if data.role == "lawyer":
        lawyer = Lawyer(
            user_id = user.id,
            first_name = data.first_name or "",
            last_name = data.last_name or ""
        )
        db.add(lawyer)

    db.commit()

    return {
        "message": f"{data.role.value} created successfully",
        "user_id": user.id,
        "email": user.email
    }

@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    data: UpdateUserRequest,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, f"User with ID {user_id} not found")
    
    # Block role changes 
    if data.role is not None and data.role != user.role.value:
        raise HTTPException(400, "Role changes are not allowed via API. Use database directly or create a new user.")
    
    # Update email if provided
    if data.email is not None:
        existing = db.query(User).filter(
            User.email == data.email,
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(400, f"Email {data.email} already taken")
        user.email = data.email
    
    # Update city/region if provided
    if data.city is not None:
        user.city = data.city
    if data.region is not None:
        user.region = data.region
    
    db.commit()
    
    return {
        "message": f"User {user_id} updated successfully",
        "user_id": user.id,
        "email": user.email,
        "role": user.role.value
    }

@router.delete("/users/{user_id}")
def delete_user(user_id:int,current_user:User = Depends(require_role("admin")),permanent:bool = Query(False,description="Permanent delete(cascade deletion)"),db:Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404,f"User with ID {user_id} not found")
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(400, "You cannot delete your own admin account")
    if permanent:
        # if you want a permanent deletion
        from app.user.router import cleanup_user_data
        cleanup_user_data(user_id,db)
        return {"message": f"User {user_id} permanently deleted"}
    else:
        # soft delete use is_active which isn't added yet
        raise HTTPException(501, "Soft delete not implemented yet.")
    

# ──────────────────────────────────────────────────────────────
# CLIENT MANAGEMENT (Admin)
# ──────────────────────────────────────────────────────────────

@router.get("/clients", response_model=PaginatedClients)
def get_all_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    query = db.query(Client, User).join(User, User.id == Client.user_id)
    total = query.count()
    results = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    clients = []
    for client, user in results:
        clients.append(AdminClientResponse(
            user_id=client.user_id,
            email=user.email,
            first_name=client.first_name,
            last_name=client.last_name,
            phone=client.phone,
            city=user.city,
            region=user.region,
            created_at=user.created_at,
        ))
    return PaginatedClients(items=clients, total=total)


# ──────────────────────────────────────────────────────────────
# RESERVATION MANAGEMENT (Admin oversee)
# ──────────────────────────────────────────────────────────────
    
@router.get("/reservations", response_model=list[ReservationAdminResponse])
def get_all_reservations(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    query = db.query(Reservation)
    if status:
        valid_status = ["accepted","completed","pending","rejected","cancelled"]
        if status not in valid_status:
            raise HTTPException(400, f"Invalid status. Must be one of: {valid_status}")
        query = query.filter(Reservation.status == status)

    reservations = query.order_by(Reservation.created_at.desc()).limit(limit).all()

    result = []
    for r in reservations:
        client = db.query(Client).filter(Client.user_id == r.client_id).first()
        client_user = db.query(User).filter(User.id == r.client_id).first() if client else None
        lawyer = db.query(Lawyer).filter(Lawyer.user_id == r.lawyer_id).first()
        lawyer_user = db.query(User).filter(User.id == r.lawyer_id).first() if lawyer else None
        result.append(ReservationAdminResponse(
            id=r.id,
            client_id=r.client_id,
            lawyer_id=r.lawyer_id,
            reservation_date=r.reservation_date,
            status=r.status,
            notes=r.notes,
            created_at=r.created_at,
            client_first_name=client.first_name if client else None,
            client_last_name=client.last_name if client else None,
            client_email=client_user.email if client_user else None,
            client_phone=client.phone if client else None,
            lawyer_first_name=lawyer.first_name if lawyer else None,
            lawyer_last_name=lawyer.last_name if lawyer else None,
            lawyer_firm=lawyer.firm if lawyer else None,
            lawyer_email=lawyer_user.email if lawyer_user else None,
        ))
    return result
    
    
# ──────────────────────────────────────────────────────────────
# LAWYER MANAGEMENT
# ──────────────────────────────────────────────────────────────
@router.get("/lawyers", response_model=PaginatedLawyers)
def get_all_lawyers(
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    
    query = db.query(Lawyer,User).join(User,User.id == Lawyer.user_id)
    if is_active is not None:
        query = query.filter(Lawyer.is_active == is_active)
    
    total = query.count()
    results = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    today = datetime.now().date()
    lawyers = []
    
    for lawyer, user in results:
        subscription = db.query(Subscription).filter(
            Subscription.lawyer_id == lawyer.user_id,
            Subscription.status == SubscriptionStatus.active,
            Subscription.start_date <= today,
            Subscription.end_date >= today
        ).first()
        
        lawyers.append(AdminLawyerResponse(
            user_id=lawyer.user_id,
            email=user.email,
            first_name=lawyer.first_name,
            last_name=lawyer.last_name,
            firm=lawyer.firm,
            specialties=lawyer.specialties,
            is_active=lawyer.is_active,
            rating_avg=float(lawyer.rating_avg) if lawyer.rating_avg else None,
            rating_count=lawyer.rating_count,
            subscription_status=subscription.status.value if subscription else "inactive"
        ))
    
    return PaginatedLawyers(items=lawyers, total=total)

@router.patch("/lawyers/{lawyer_id}/toggle-active")
def toggle_lawyer_active(
    lawyer_id: int,
    is_active: bool = True,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(404, f"Lawyer with ID {lawyer_id} not found")
    
    lawyer.is_active = is_active
    db.commit()
    
    status = "activated" if is_active else "deactivated"
    return {"message": f"Lawyer {lawyer_id} {status}"}