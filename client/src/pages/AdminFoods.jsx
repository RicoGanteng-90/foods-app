import api from "../api/axios";
import AdminFoodCard from "../components/AdminFoodCard";
import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";

function AdminFoods() {
  const [foods, setFoods] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const getAllFoods = async () => {
    const { data } = await api.get("/foods", {
      params: {
        search,
        page,
        limit: 10,
      },
    });

    setFoods(data.result);
    setTotalPages(data.totalPages);
  };

  const handleDelete = async (id) => {
    await api.delete(`/foods/${id}`);
    alert("Food deleted");
    getAllFoods();
  };

  useEffect(() => {
    const delayBounceFn = setTimeout(() => {
      getAllFoods();
    }, 500);

    return () => clearTimeout(delayBounceFn);
  }, [page, search]);

  return (
    <div>
      <h1>Food list</h1>

      <input
        type="text"
        placeholder="Search food"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      <br />
      <br />

      {foods.map((food) => (
        <AdminFoodCard key={food._id} food={food} onDelete={handleDelete} />
      ))}

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

export default AdminFoods;
