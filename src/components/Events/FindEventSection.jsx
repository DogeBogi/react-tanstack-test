import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../util/http';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';
import EventItem from './EventItem';
export default function FindEventSection() {
  const searchElement = useRef();
  const [stateSearchElement, setSearchElement] = useState();
  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['events', {searchTerm: stateSearchElement} ],
    queryFn: ({signal, queryKey })=>fetchEvents({signal, ...queryKey[1]}),
    enabled: stateSearchElement !== undefined, 
  })
  function handleSubmit(event) {
    event.preventDefault();
    setSearchElement(searchElement.current.value)
  }
  let content = <p>Please enter a search term and to find events.</p> ;
  
  if(isLoading){
    content = <LoadingIndicator/>
  }
  if(isError){
    content =  <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch events.'} />
  }

  if(data){
    content = (
      <ul>
        {data.map((dataElem)=> <li key={dataElem.id}><EventItem event={dataElem}/></li>)}
      </ul> 
    )
  }
  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      {content}
      </header>
    </section>
  );
}
