const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className='search'>
      <div>
        <img src='search.svg' alt='search' />
        <input
          type='text'
          placeholder='Search through thousands of movies'
          value={searchTerm}
          onChange={(ev) => setSearchTerm(ev.target.value)}
        />
      </div>
    </div>
  );
};

export default Search;
