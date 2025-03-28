import { FireItem } from '../../../shared/types/fire-data.types';

function FireList({ items }: { items: FireItem[] }) {
  return (
    <table className="table-auto border-collapse w-full text-sm">
      <thead>
        <tr className="bg-gray-200">
          <th className="border px-2 py-1">번호</th>
          <th className="border px-2 py-1">주소</th>
          <th className="border px-2 py-1">진행률</th>
          <th className="border px-2 py-1">상태</th>
          <th className="border px-2 py-1">발생날짜</th>
          <th className="border px-2 py-1">산불레벨</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="hover:bg-gray-100">
            <td className="border px-2 py-1">{item.index}</td>
            <td className="border px-2 py-1">{item.location}</td>
            <td className="border px-2 py-1">{item.percentage}</td>
            <td className="border px-2 py-1">{item.status}</td>
            <td className="border px-2 py-1">
              {item.date.slice(0, 4)}-{item.date.slice(4, 6)}-{item.date.slice(6, 8)}
            </td>
            <td className="border px-2 py-1">{item.issueName}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default FireList;
