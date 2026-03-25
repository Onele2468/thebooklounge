window.books = []; // Global array to hold books

window.loadSanityBooks = async function() {
  try {
    // Dynamically import Sanity client and image builder from CDN
    const { createClient } = await import('https://esm.sh/@sanity/client');
    const imageUrlBuilder = (await import('https://esm.sh/@sanity/image-url')).default;

    const client = createClient({
      projectId: 'denvgz3m',
      dataset: 'production',
      useCdn: true, // `false` if you want to ensure fresh data
      apiVersion: '2024-03-23'
    });

    const builder = imageUrlBuilder(client);
    function urlFor(source) {
      return builder.image(source);
    }

    // Include the stock field, if not present in schema it returns null, which defaults to in stock
    const query = '*[_type == "book"]{_id, title, price, "imageUrl": image.asset->url, "authorName": author->name, category, description}';
    const sanityBooks = await client.fetch(query);

    window.books = sanityBooks.map(b => ({
      _id: b._id, // Adding _id as requested
      id: b._id, // Kept id for backward compatibility with cart, etc.
      title: b.title,
      authorName: b.authorName || "Unknown",
      category: b.category ? b.category.toLowerCase() : "fiction",
      price: b.price || 0,
      imageUrl: b.imageUrl,
      description: b.description || "No description available.",
      stock: "in stock" // Modify your Sanity schema if you want to track dynamic stock
    }));
    
    console.log("Successfully loaded books from Sanity:", window.books);
  } catch (error) {
    console.error("Error fetching from Sanity:", error);
  }
};