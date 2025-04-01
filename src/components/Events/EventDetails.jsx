import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import Header from '../Header.jsx';
import { fetchEvent } from '../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useMutation } from '@tanstack/react-query';
import { deleteEvent } from '../util/http.js';
import { queryClient } from '../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import Modal from '../UI/Modal.jsx';
import { useState } from 'react';
export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()
  const params = useParams()
  // console.log(curId)
  const {data, isPending, isError, error} = useQuery({
    queryKey : ['events', params.id],
    queryFn : ({signal})=>fetchEvent({signal, id: params.id})
  })
  const {mutate, isPending: isPendingDelete} = useMutation({
    mutationFn: ()=>deleteEvent(params),
    onSuccess : ()=>{
      queryClient.invalidateQueries(
        {queryKey: ['events'],
        refetchType: 'none'}
      )
      navigate('/events')
    }
  })
  function handleDelete(){
      mutate({params})
  }
  let formatedDate;
  if(data){
    formatedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  function startDeleting(){
    setIsDeleting(true)
  }
  function cancelDeleting(){
    setIsDeleting(false)
  }
  return (
    <>
      {isDeleting && <Modal>
          <h2>Are you realy want to delete this event?</h2>
          <div className='form-actions'>
            <button onClick={cancelDeleting} className='button-text'>Cancel</button>
            <button onClick={handleDelete} className='button'>{isPendingDelete ? "Deleting..." : "Delete"  }</button>
          </div>
      </Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {isPending && <LoadingIndicator/>}
        {isError && <ErrorBlock title="Fetching Error" message={error.info?.message || 'Somthing going wrong'}/>}
        {data && <div id="event-details-content">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={startDeleting}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
          <img src={`http://localhost:3000/${data.image}`}alt="image" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formatedDate}@{data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>}
      </article>
    </>
  );
}
