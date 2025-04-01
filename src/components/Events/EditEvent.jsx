import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, updateEvent, queryClient } from '../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useMutation } from '@tanstack/react-query';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const {data, isPending, isError, error} = useQuery({
    queryKey:['events',params.id],
    queryFn : ({signal})=>fetchEvent({signal,id: params.id})
  })
  const {mutate} = useMutation({
    mutationFn: updateEvent,
    onMutate : async (data) =>{
      const newEvent = data.event;

      await queryClient.cancelQueries(['events', params.id])
      
      const previousEvent = queryClient.getQueryData(['events', params.id])

      queryClient.setQueryData(['events', params.id], newEvent)
      return{previousEvent}
    },
    onError: (error, data, context) =>{
      queryClient.setQueryData(['events', params.id], context.previousEvent)
    },
    onSettled : () =>{
      queryClient.invalidateQueries(['events', params.id])
    }
  })
  function handleSubmit(formData) {
    mutate({id: params.id, event:formData});
    navigate('../')
  }

  function handleClose() {
    navigate('../');
  }

  return (
    <Modal onClose={handleClose}>
      {isPending && <div className='center'>
          <LoadingIndicator/>
        </div>}
        {isError && 
        <>
        <ErrorBlock title="Can't fetch the data" message={error.info?.message || 'Somthing going wrong'}/>
        <div className='form-actions'>
          <Link to="../" className='button'> 
           Okay
          </Link>
        </div>
        </>}

      {data && <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>}
    </Modal>
  );
}
