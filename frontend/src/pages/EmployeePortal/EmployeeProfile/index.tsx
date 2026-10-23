import PageWrapper from "../../../components/PageWrapper";
import ProfileEditor from "../../../components/ProfileEditor";

export default function EmployeeProfile() {
  return (
    <PageWrapper title="Profil Karyawan" subtitle="Lihat profil karyawan.">
      <ProfileEditor />
    </PageWrapper>
  );
}
