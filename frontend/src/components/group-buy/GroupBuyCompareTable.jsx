import { Link } from "react-router-dom";

const PAYMENT_METHOD_LABELS = {
  bank_transfer: "匯款",
  cash_on_delivery: "可取付",
  other: "其他",
};

const UNAVAILABLE_REASON_LABELS = {
  closed: "已結單",
  expired: "已截止",
  activity_ended: "活動已結束",
  full: "已額滿",
};

function formatDeadline(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  });
}

export default function GroupBuyCompareTable({ groupBuys }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>團主</th>
            <th>價格 (TWD)</th>
            <th>付款方式</th>
            <th>需二補</th>
            <th>含滿贈</th>
            <th>收單時間</th>
            <th>剩餘數量</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {groupBuys.map((groupBuy) => (
            <tr key={groupBuy.group_buy_product_id}>
              <td>
                <Link to={`/group-leaders/${groupBuy.group_leader.id}`}>
                  {groupBuy.group_leader.display_name}
                </Link>
              </td>
              <td>NT$ {groupBuy.unit_price}</td>
              <td>
                {PAYMENT_METHOD_LABELS[groupBuy.payment_method]}
                {groupBuy.payment_method_note ? `（${groupBuy.payment_method_note}）` : ""}
              </td>
              <td>{groupBuy.requires_second_payment ? "是" : "否"}</td>
              <td>{groupBuy.includes_full_gift ? "有" : "無"}</td>
              <td>{formatDeadline(groupBuy.deadline_at)}</td>
              <td>
                {groupBuy.is_available ? (
                  <span style={{ color: "var(--color-success)" }}>
                    剩餘 {groupBuy.available_quantity}
                  </span>
                ) : (
                  <span style={{ color: "var(--color-danger)" }}>
                    {UNAVAILABLE_REASON_LABELS[groupBuy.effective_status] ?? "不可跟團"}
                  </span>
                )}
              </td>
              <td>
                <Link
                  className="btn btn-primary"
                  to={`/group-buys/${groupBuy.id}?product=${groupBuy.group_buy_product_id}`}
                >
                  查看開團詳情
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
