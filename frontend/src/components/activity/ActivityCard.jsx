import { Link } from "react-router-dom";
import MediaImage from "../common/MediaImage.jsx";
import { ChevronRightIcon } from "../common/icons.jsx";

export default function ActivityCard({ activity }) {
  return (
    <Link to={`/activities/${activity.id}`} className="card">
      <MediaImage
        className="card-image"
        src={activity.image_url}
        alt={activity.name}
        loading="lazy"
      />
      <div className="card-body card-body-row">
        <h3 className="card-title">{activity.name}</h3>
        <ChevronRightIcon className="card-arrow" />
      </div>
    </Link>
  );
}
