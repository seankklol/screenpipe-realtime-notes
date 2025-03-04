import NotesGenerator from '@/components/notes/NotesGenerator';

export default function NotesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Meeting Notes Generator
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Automatically generate comprehensive meeting notes from transcripts and visual content
          </p>
        </div>
        
        <div className="mt-10">
          <NotesGenerator />
        </div>
      </div>
    </div>
  );
} 