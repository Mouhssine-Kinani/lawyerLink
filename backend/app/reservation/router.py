from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.user.model import User, Client
from app.lawyer.model import Lawyer
from app.payment.model import Subscription, SubscriptionStatus
from app.reservation.model import Reservation, ReservationStatus
from app.reservation.schema import ReservationCreate, ReservationUpdate, ReservationResponse

router = APIRouter(prefix="/reservations",tags=["Reservations"]) #name of endpoints

# ──────────────────────────────────────────────────────────────
# Create reservation:
# ──────────────────────────────────────────────────────────────

@router.post("/",response_model=ReservationResponse,status_code=201) #response is the shape of the data that will be returned in the end and validated automaticaly
def create_reservation(data:ReservationCreate,current_user:User = Depends(get_current_user),db:Session = Depends(get_db)):
    # verify if user is a client(only clients make reservations)
    if current_user.role.value != "client":
        raise HTTPException(404,"client profile not found")
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(404,'Client profile not found')
    # verify if lawyer exists and is active
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == data.lawyer_id,Lawyer.is_active == True).first() #data is the json request that was sent by the client from frontend and was validataed by the pydantic model createReservations,its a python object
    if not lawyer:
        raise HTTPException(404,'lawyer profile not found')
    # check if lawyer subscription is still active
    today = datetime.now().date()
    active_sub = db.query(Subscription).filter(
        Subscription.lawyer_id == data.lawyer_id,
        Subscription.status == SubscriptionStatus.active, #subscriptionStatus is in schema
        Subscription.start_date <= today,
        Subscription.end_date >= today,
    ).first()
    if not active_sub:
        raise HTTPException(404,"the lawyer is not accepting new clients")
    # check if the timeslot is already booked(if the lawyer already have a reservation in this time period)
    existing = db.query(Reservation).filter(
        Reservation.lawyer_id == data.lawyer_id,
        Reservation.reservation_date == data.reservation_date,
        Reservation.status.in_([ReservationStatus.pending,ReservationStatus.accepted]) #status of reservation should be either pending ot accepted
    ).first()
    if existing:
        raise HTTPException(404,"this time slot is already booked")
    # create reservation:
    reservation = Reservation(
        client_id = client.user_id,
        lawyer_id=data.lawyer_id,
        reservation_date=data.reservation_date,
        status = ReservationStatus.pending, #by default pending
        notes = data.notes
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    # future: Send notification to lawyer
    # notify_lawyer(lawyer.user_id, f"New reservation from {client.first_name}")
    return reservation


# ──────────────────────────────────────────────────────────────
# Get Reservations(clients and lawyers)
# ──────────────────────────────────────────────────────────────

@router.get("/",response_model=list[ReservationResponse])
def get_reservations(status:Optional[ReservationStatus] = Query(None), #status can either be pending,rejected...or none in the url and by default it's None
                    limit:int = Query(50,ge=1,le=100), #by default we get 50 reservations(if there is that many) and the limit is 100
                    current_user:User = Depends(get_current_user),
                    db:Session = Depends(get_db)
):
    query = db.query(Reservation) #this is just a query builder
    # verify user role:
    if current_user.role.value == "client":
        client = db.query(Client).filter(Client.user_id == current_user.id).first() #verify if client exist
        if not client:
            raise HTTPException(404,"Client profile not found")
        query = query.filter(Reservation.client_id == client.user_id) # if exists get only reservations for that client
    elif current_user.role.value == "lawyer":
        query = query.filter(Reservation.lawyer_id == current_user.id) # get only the reservations of the lawyer
    else:
        raise HTTPException(403, "Invalid role")
    # verify status of reservation
    if status:
        query = query.filter(Reservation.status == status)

    # get all reservations while respecting the limit and also from newest to oldest
    return query.order_by(Reservation.reservation_date.desc()).limit(limit).all() 
# ──────────────────────────────────────────────────────────────
# Get Single Reservation
# ──────────────────────────────────────────────────────────────
# we use a path parametre and we take the value of reservation_id,convert it into int and put it into the parametre with the same name
@router.get("/{reservation_id}",response_model=ReservationResponse)
def get_reservation(reservation_id:int,current_user:User = Depends(get_current_user),db:Session = Depends(get_db)):
    # find the reservation with the same id
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(404, "Reservation not found")
    
    # Check permission(we first check the role of user and then if he exist and then if his id is the same user_id of the reservation)
    if current_user.role.value == "client":
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if reservation.client_id != client.user_id:
            raise HTTPException(403, "Not your reservation")
    elif current_user.role.value == "lawyer":
        if reservation.lawyer_id != current_user.id:
            raise HTTPException(403, "Not your reservation")
    else:
        raise HTTPException(403, "Invalid role")   
    return reservation


# ──────────────────────────────────────────────────────────────
# UPDATE RESERVATION STATUS
# ──────────────────────────────────────────────────────────────
#we use patch and not put cause here we will not necessarily modify all the reservation
@router.patch("/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: int,
    update: ReservationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # we get the wanted reservation  
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(404, "Reservation not found")
    
    # Check permissions(as in if the reservation belong to this particular user)
    if current_user.role.value == "client":
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if reservation.client_id != client.user_id:
            raise HTTPException(403, "Not your reservation")
        
        if update.status is not None:
            # Clients can only cancel pending reservations
            if update.status != ReservationStatus.cancelled:
                raise HTTPException(403, "Clients can only cancel reservations")
            if reservation.status != ReservationStatus.pending:
                raise HTTPException(400, "Can only cancel pending reservations")
            # Clients cannot change reservation_date 
            if update.reservation_date is not None:
                raise HTTPException(403, "Clients cannot change reservation date")

    elif current_user.role.value == "lawyer":
        if reservation.lawyer_id != current_user.id:
            raise HTTPException(403, "Not your reservation")
        
        if update.status is not None:
            # Validate lawyer status transitions(pending->accepted,rejected and accepted->completed)
            if update.status == ReservationStatus.accepted:
                if reservation.status != ReservationStatus.pending:
                    raise HTTPException(400, "Can only accept pending reservations")
            elif update.status == ReservationStatus.rejected:
                if reservation.status != ReservationStatus.pending:
                    raise HTTPException(400, "Can only reject pending reservations")
            elif update.status == ReservationStatus.completed:
                if reservation.status != ReservationStatus.accepted:
                    raise HTTPException(400, "Can only complete accepted reservations")
            else:
                raise HTTPException(400, "Invalid status change")
        
        # Lawyers CAN change reservation_date BUT only for pending reservations
        if update.reservation_date is not None:
            if reservation.status != ReservationStatus.pending:
                raise HTTPException(400, "Can only change date for pending reservations")
            
            # Check if the new time slot is available(if there is no reservation beside this one that already chose this timeslot)
            existing = db.query(Reservation).filter(
                Reservation.lawyer_id == reservation.lawyer_id,
                Reservation.reservation_date == update.reservation_date,
                Reservation.id != reservation_id,  # Don't count this reservation
                Reservation.status.in_([ReservationStatus.pending, ReservationStatus.accepted])
            ).first()
            if existing:
                raise HTTPException(409, "This new time slot is already booked")
            
    else:
        raise HTTPException(403, "Invalid role")
    
    changed = False
    # Update existing status with new status(accepted,rejected...)
    if update.status is not None:
        reservation.status = update.status
        changed = True
        # notifications for future:
        if update.status == ReservationStatus.accepted:
            #Notify client "Your reservation was accepted"
            pass
        elif update.status == ReservationStatus.rejected:
            #Notify client "Your reservation was rejected"
            pass
        elif update.status == ReservationStatus.completed:
            #Notify client "Session completed, leave a review"
            pass

    # Update reservation date if provided (lawyers only)
    if update.reservation_date is not None:
        reservation.reservation_date = update.reservation_date
        changed = True
        # Notify client "Your reservation time has been changed"
    
    # Update notes if provided (for lawyers and clients both)
    if update.notes is not None:
        reservation.notes = update.notes
        changed = True

    if not changed:
        # Nothing to update
        raise HTTPException(400, "No fields to update")
        
    db.commit()
    db.refresh(reservation)
    
    return reservation

# ──────────────────────────────────────────────────────────────
# CANCEL RESERVATION (as in delete reservation that is still not accepted)
# ──────────────────────────────────────────────────────────────
# used to cancel a pending reservation
@router.delete("/{reservation_id}")
def cancel_reservation(reservation_id: int,current_user: User = Depends(get_current_user),db: Session = Depends(get_db)): 
    
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(404, "Reservation not found")
    
    if current_user.role.value != "client":
        raise HTTPException(403, "Only clients can cancel reservations")
    
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if reservation.client_id != client.user_id:
        raise HTTPException(403, "Not your reservation")
    
    if reservation.status != ReservationStatus.pending:
        raise HTTPException(400, "Only pending reservations can be cancelled")
    
    reservation.status = ReservationStatus.cancelled
    db.commit()
    
    return {"message": "Reservation cancelled successfully"}





