import React, { useState, useEffect } from "react";

import Card from "@/components/ui/Card";
import InputGroup from "@/components/ui/InputGroup";
import Icon from "@/components/ui/Icon";
import ProductBox from "@/components/partials/ecommerce/product-box";
import { categories, selectOptions, selectCategory } from "@/constant/data";

import ProductList from "@/components/partials/ecommerce/product-list";
import CatagoriesFilterCheckbox from "@/components/partials/ecommerce/catagories-filter-checkbox";
import clsx from "clsx";
import Select from "react-select";
import {
  updateSearchFilter,
  updateCategoryFilter,
} from "@/store/api/shop/action";
import { useSelector, useDispatch } from "react-redux";
import Alert from "@/components/ui/Alert";
import LoaderCircle from "@/components/Loader-circle";
import productService from "@/services/productService";

const Ecommerce = () => {
  // all products get
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products dynamically from the backend API.
  // Products are added by the admin; when none exist yet, the page shows an
  // empty state instead of falling back to bundled demo data.
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        const data = await productService.getProducts();
        const apiProducts = data?.products || [];
        if (isMounted) {
          setProducts(apiProducts);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        if (isMounted) {
          setIsError(true);
          setError(err?.message || "Failed to load products");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const dispatch = useDispatch();

  const searchFilter = useSelector((state) => state.cart.filters.search);
  const categoryFilter = useSelector((state) => state.cart.filters.category);

  const styles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "trasparent",
    }),

    option: (provided, state) => ({
      ...provided,
      fontSize: "14px",
    }),
  };
  // search
  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    dispatch(updateSearchFilter(searchTerm));
  };
  // category

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    dispatch(updateCategoryFilter(category));
  };

  const [view, setView] = useState("grid");

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchFilter.toLowerCase())
    )

    .filter(
      (product) =>
        categoryFilter === "all" || product.category === categoryFilter
    );

if (isLoading) {
    return <LoaderCircle />;
  }

  return (
    <div>
      <div className="grid grid-cols-12  gap-5">
        <Card className="lg:col-span-3 lg:block  hidden   xs h-max col-span-12">
          <InputGroup
            type="text"
            prepend={<Icon icon="heroicons-outline:search" />}
            placeholder="Search"
            merged
            value={searchFilter}
            onChange={handleSearchChange}
          />
          <div className="space-y-1">
            <div className="space-y-1 -ms-6 px-6 py-3">
              <div className="text-slate-800 dark:text-slate-200 font-semibold text-xs uppercase py-2">
                categories
              </div>
              {categories.map((category, i) => (
                <CatagoriesFilterCheckbox
                  key={`cata_key_${i}`}
                  categoryFilter={categoryFilter}
                  handleCategoryChange={handleCategoryChange}
                  category={category}
                />
              ))}

              <button className="text-xs font-medium text-slate-900 dark:text-slate-300 pt-1">
                View Less
              </button>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-9  col-span-12">
          <div>
            {/* header for product filter */}
            <div className="md:flex mb-6 md:space-y-0 space-y-4">
              <div className="flex-1 flex  items-center space-x-3 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={clsx(
                    " border border-slate-400 dark:border-slate-700 text-slate-400 rounded-sm h-11 w-11  inline-flex  items-center  justify-center transition-all duration-200",
                    {
                      "border-slate-900 text-slate-900 dark:border-slate-300/80 dark:text-slate-200":
                        view === "grid",
                    }
                  )}
                >
                  <Icon icon="heroicons:view-columns" className=" w-6 h-6" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={clsx(
                    " border border-slate-400 dark:border-slate-700 text-slate-400 rounded-sm h-11 w-11  inline-flex  items-center  justify-center transition-all duration-200",
                    {
                      "border-slate-900 text-slate-900 dark:border-slate-300/80  dark:text-slate-200":
                        view === "list",
                    }
                  )}
                >
                  <Icon className=" w-6 h-6" icon="heroicons:list-bullet" />
                </button>
              </div>
              <div className="flex-none sm:flex items-center sm:space-x-4 sm:rtl:space-x-reverse sm:space-y-0 space-y-2">
                <div className=" flex space-x-3  rtl:space-x-reverse  items-center">
                  <label
                    htmlFor="select"
                    className="text-sm font-normal text-[#68768A] "
                  >
                    Show:
                  </label>
                  <Select
                    className="rounded-sm text-sm font-normal text-[#68768A]"
                    classNamePrefix="select"
                    defaultValue={selectOptions[0]}
                    options={selectOptions}
                    styles={styles}
                    id="hh"
                  />
                </div>
                <div className=" flex space-x-3  rtl:space-x-reverse items-center">
                  <label
                    htmlFor="select"
                    className="text-sm font-normal text-[#68768A] "
                  >
                    Sort by:
                  </label>
                  <Select
                    className="rounded-sm text-sm font-normal text-[#68768A]"
                    classNamePrefix="select"
                    defaultValue={selectCategory[0]}
                    options={selectCategory}
                    styles={styles}
                    id="hh"
                  />
                </div>
              </div>
            </div>
            {/* content */}
            {/* product grid view */}
            {view === "grid" && (
              <div className="grid 2xl:grid-cols-3 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3 h-max">
                {filteredProducts.length > 0 ? (
                  filteredProducts?.map((item, i) => (
                    <ProductBox key={`grid_key_${i}`} item={item} />
                  ))
                ) : (
                  <div className="col-span-12">
                    <Alert className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-6 text-center">
                      No Courses available yet. Check back soon.
                    </Alert>
                  </div>
                )}
              </div>
            )}
            {/* product list view  */}
            {view === "list" && (
              <div className=" space-y-3 grid-cols-1 gap-5 h-max">
                {filteredProducts.length > 0 ? (
                  filteredProducts?.map((item, i) => (
                    <div key={`list_key_${i}`}>
                      <ProductList item={item} key={i} />
                    </div>
                  ))
                ) : (
                  <Alert className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-6 text-center">
                    No Courses available yet. Check back soon.
                  </Alert>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ecommerce;
