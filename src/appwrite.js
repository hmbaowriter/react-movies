import { Client, Databases, ID, Query } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// console.log({ PROJECT_ID, DATABASE_ID, COLLETION_ID });

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID);

const database = new Databases(client);

// * COMPLETED: Implement updateSearchCount function
const updateSearchCount = async (searchTerm, movie) => {
  // 1. Use Appwrite SDK to check if the search term exists in the database
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm.toLowerCase()),
    ]);

    // 2. If it exists, increment the count
    if (result.documents.length > 0) {
      const doc = result.documents[0];

      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      });
      // 3. If it doesn't exist, create a new record with the search term and count as 1
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: searchTerm.toLowerCase(),
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error(`Error fetching search term: ${error}`);
  }
};

// TODO: Implement getTrendingMovies function (base on search count)
const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc('count'),
    ]);

    return result.documents;
  } catch (error) {
    console.error(`Error fetching trending movies: ${error}`);
  }
};

export { updateSearchCount, getTrendingMovies };
