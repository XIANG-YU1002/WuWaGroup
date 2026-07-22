from typing import Any, Sequence


def envelope(data: Any) -> dict:
    return {"data": data}


def paginated_envelope(
    items: Sequence[Any], page: int, page_size: int, total_items: int
) -> dict:
    total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 0
    return {
        "data": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_previous": page > 1,
            "has_next": page < total_pages,
        },
    }
