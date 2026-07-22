import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="card">
      <img
        className="card-image card-image-square"
        src={product.primary_image_url}
        alt={product.name}
        loading="lazy"
      />
      <div className="card-body">
        <h3 className="card-title">{product.name}</h3>
      </div>
    </Link>
  );
}
