import { useState, useEffect } from "react";
import FoodCard from "../components/FoodCard";
import api from "../api/axios";
import Pagination from "../components/Pagination";

function Home() {
  const [foods, setFoods] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const getAllFoods = async () => {
    const { data } = await api.get(`/foods`, {
      params: {
        page,
        limit: 10,
        search,
      },
    });

    setFoods(data.result);
    setTotalPages(data.totalPages);
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

      {foods.map((food) => (
        <FoodCard key={food._id} food={food} />
      ))}

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

export default Home;
