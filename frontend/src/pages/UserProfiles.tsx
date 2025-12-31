import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";

export default function UserProfiles() {
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    // fetch primary user info from backend (adjust endpoint as needed)
    fetch("http://localhost:5000/api/user")
      .then((r) => r.json())
      .then((data) => setUser(data?.user ?? data))
      .catch(() => setUser(null));

    // fetch admin profile (optional)
    fetch("http://localhost:5000/api/admin")
      .then((r) => r.json())
      .then((data) => setAdmin(data?.admin ?? data))
      .catch(() => setAdmin(null));
  }, []);

  return (
    <>
      <PageMeta
        title="Profile"
        description="User profile page"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard user={user} />
          <UserInfoCard user={user} />
          <UserAddressCard address={user?.address} />
        </div>

        {admin && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-2">Admin Profile</h4>
            <div className="text-sm text-gray-700 dark:text-gray-200">{(admin.firstName || admin.lastName) ? `${admin.firstName ?? ''} ${admin.lastName ?? ''}` : (admin.name ?? '')}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{admin.email ?? ''}</div>
          </div>
        )}
      </div>
    </>
  );
}
