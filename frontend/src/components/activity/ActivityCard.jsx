import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge.jsx";
import MediaImage from "../common/MediaImage.jsx";

export default function ActivityCard({ activity }) {
  return (
    <Link to={`/activities/${activity.id}`} className="card">
      <MediaImage className="card-image" src={activity.image_url} alt={activity.name} loading="lazy" />
      <div className="card-body">
        <h3 className="card-title">{activity.name}</h3>
        <StatusBadge domain="activity" value={activity.status} />
      </div>
    </Link>
  );
}
