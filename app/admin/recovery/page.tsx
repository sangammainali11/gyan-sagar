import { db } from "@/lib/db";
import { format } from "date-fns";

const AdminRecoveryPage = async () => {
  const requests = await db.recoveryRequest.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 100 // show latest 100
  });

  return (
    <div className="p-6">
      <div className="flex flex-col gap-y-2 mb-6">
        <h1 className="text-2xl font-bold">Account Recovery Log</h1>
        <p className="text-sm text-muted-foreground">
          Monitor forgotten password requests and detect suspicious activity.
        </p>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-b hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(req.createdAt), "MMM dd, yyyy HH:mm")}
                </td>
                <td className="px-6 py-4 font-medium">{req.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${req.status === "VERIFIED" ? "bg-emerald-100 text-emerald-700" : ""}
                    ${req.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : ""}
                    ${req.status === "SUSPICIOUS" ? "bg-rose-100 text-rose-700" : ""}
                  `}>
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-8 text-muted-foreground">
                  No recovery requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRecoveryPage;
