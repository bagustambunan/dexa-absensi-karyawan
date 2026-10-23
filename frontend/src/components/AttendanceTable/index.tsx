import { Table, type TableProps } from "antd";
import { renderDateTime } from "../../utils";

type AttendanceRow = {
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  employeeId?: string;
};

export default function AttendanceTable<T extends AttendanceRow>({
  data,
  loading,
  extraColumns = [],
  emptyText = "Tidak ada absensi yang ditemukan",
}: {
  data: T[];
  loading: boolean;
  extraColumns?: TableProps<T>["columns"];
  emptyText?: string;
}) {
  return (
    <Table<T>
      rowKey={(record) => `${record.employeeId ?? ""}-${record.date}`}
      columns={[
        ...extraColumns,
        { title: "Tanggal", dataIndex: "date" },
        {
          title: "Jam Masuk (WIB)",
          dataIndex: "checkInAt",
          render: renderDateTime,
        },
        {
          title: "Jam Pulang (WIB)",
          dataIndex: "checkOutAt",
          render: renderDateTime,
        },
      ]}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: extraColumns.length ? 800 : 600 }}
      locale={{ emptyText }}
    />
  );
}
