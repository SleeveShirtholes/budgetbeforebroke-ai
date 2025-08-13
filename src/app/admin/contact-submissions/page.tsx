import { getContactSubmissions } from "@/app/actions/contact";
import ContactSubmissionsClient from "./ContactSubmissionsClient";

export default async function ContactSubmissionsPage() {
  const result = await getContactSubmissions();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Contact Submissions</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-600">
            Error loading contact submissions: {result.error}
          </p>
        </div>
      </div>
    );
  }

  if (!result.submissions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Contact Submissions</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-600">No submissions found</p>
        </div>
      </div>
    );
  }

  // Cast the submissions to the correct type
  const typedSubmissions = result.submissions.map((sub) => ({
    ...sub,
    status: sub.status as "new" | "in_progress" | "resolved" | "closed",
  }));

  return <ContactSubmissionsClient initialSubmissions={typedSubmissions} />;
}
