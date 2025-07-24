export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <form className="flex flex-col gap-4 w-full max-w-md bg-gray-900 p-8 rounded-lg shadow">
        <input type="text" placeholder="Your Name" className="px-3 py-2 rounded bg-black border border-gray-700 text-white" required />
        <input type="email" placeholder="Your Email" className="px-3 py-2 rounded bg-black border border-gray-700 text-white" required />
        <textarea placeholder="Your Message" className="px-3 py-2 rounded bg-black border border-gray-700 text-white" rows={4} required />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded">Send Message</button>
      </form>
    </div>
  );
} 