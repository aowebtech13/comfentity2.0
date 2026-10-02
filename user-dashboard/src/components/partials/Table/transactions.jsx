import React, { useState, useMemo } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { MenuItem } from "@headlessui/react";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "../../../pages/table/react-tables/GlobalFilter";

const COLUMNS = [
  {
    Header: "customer",
    accessor: "customer",
    Cell: (row) => {
      return (
        <div>
          <span className="inline-flex items-center">
            <span className="w-7 h-7 rounded-full ltr:mr-3 rtl:ml-3 flex-none bg-slate-600">
              <img
                src={row?.cell?.value.image}
                alt=""
                className="object-cover w-full h-full rounded-full"
              />
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-300 capitalize font-medium">
              {row?.cell?.value.name}
            </span>
          </span>
        </div>
      );
    },
  },
  {
    Header: "date",
    accessor: "date",
    Cell: (row) => {
      return (
        <span className="text-slate-500 dark:text-slate-400">
          {row?.cell?.value}
        </span>
      );
    },
  },
  {
    Header: "HISTORY",
    accessor: "quantity",
    Cell: (row) => {
      return (
        <span className="text-slate-500 dark:text-slate-400">
          <span className="block text-slate-600 dark:text-slate-300">
            {row?.cell?.value.type}
          </span>
          <span className="block text-slate-500 text-xs">
            {row?.cell?.value.description}
          </span>
        </span>
      );
    },
  },

  {
    Header: "amount",
    accessor: "status",
    Cell: (row) => {
      const amount = row?.cell?.value.amount;
      const isPositive = amount >= 0;
      return (
        <span className="block w-full">
          <span
            className={`
              ${isPositive ? "text-success-500" : "text-danger-500"}
            `}
          >
            {isPositive ? "+" : ""}
            {amount?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </span>
        </span>
      );
    },
  },
  {
    Header: "action",
    accessor: "action",
    Cell: (row) => {
      return (
        <div className=" text-center">
          <Dropdown
            classMenuItems="right-0 w-[140px] top-[110%] "
            label={
              <span className="text-xl text-center block w-full">
                <Icon icon="heroicons-outline:dots-vertical" />
              </span>
            }
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {actions.map((item, i) => (
                <MenuItem key={i}>
                  <div
                    className={`
                    ${
                      item.name === "delete"
                        ? "bg-danger-500 text-danger-500 bg-opacity-30   hover:bg-opacity-100 hover:text-white"
                        : "hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600 dark:hover:bg-opacity-50"
                    }
                     w-full border-b border-b-gray-500/10 px-4 py-2 text-sm  last:mb-0 cursor-pointer first:rounded-t last:rounded-b flex  space-x-2 items-center rtl:space-x-reverse `}
                  >
                    <span className="text-base">
                      <Icon icon={item.icon} />
                    </span>
                    <span>{item.name}</span>
                  </div>
                </MenuItem>
              ))}
            </div>
          </Dropdown>
        </div>
      );
    },
  },
];

const actions = [
  {
    name: "view",
    icon: "heroicons-outline:eye",
  },
  {
    name: "edit",
    icon: "heroicons:pencil-square",
  },
  {
    name: "delete",
    icon: "heroicons-outline:trash",
  },
];

/**
 * Format a backend transaction object into the shape expected by the table.
 */
const formatTransaction = (tx) => {
  const amount = parseFloat(tx.amount) || 0;
  const date = tx.created_at
    ? new Date(tx.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return {
    id: tx.id,
    customer: {
      name: tx.description || tx.type || "—",
      image: null,
    },
    date,
    quantity: {
      type: tx.type,
      description: tx.description || "",
    },
    amount,
    status: tx.status,
    action: null,
  };
};

/**
 * TransactionsTable — displays a paginated, sortable, filterable table
 * of the user's transactions.
 *
 * Props:
 *   transactions: Array<Transaction>  — raw backend transaction objects
 *   stats: { total_inflows, total_outflows, net_flow } — summary stats
 *   loading: boolean — show skeleton rows while fetching
 */
const TransactionsTable = ({ transactions = [], stats, loading = false }) => {
  const formattedData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    return transactions.map(formatTransaction);
  }, [transactions]);

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => formattedData, [formattedData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 4,
      },
    },

    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    pageCount,
    setPageSize,
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "$0.00";
    return `$${parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      <Card noBorder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">All transactions</h4>
          <div>
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total inflows
              </div>
              <div className="text-lg font-medium text-success-500">
                {formatCurrency(stats.total_inflows)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total outflows
              </div>
              <div className="text-lg font-medium text-danger-500">
                {formatCurrency(stats.total_outflows)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Net flow
              </div>
              <div className="text-lg font-medium text-slate-900 dark:text-white">
                {formatCurrency(stats.net_flow)}
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden ">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700!"
                {...getTableProps()}
              >
                <thead className="border-t border-slate-100 dark:border-slate-800!">
                  {headerGroups.map((headerGroup) => {
                    const { key: headerGroupKey, ...restHeaderGroupProps } =
                      headerGroup.getHeaderGroupProps();
                    return (
                      <tr key={headerGroupKey} {...restHeaderGroupProps}>
                        {headerGroup.headers.map((column) => {
                          const { key: columnKey, ...restColumnProps } =
                            column.getHeaderProps(
                              column.getSortByToggleProps()
                            );
                          return (
                            <th
                              key={columnKey}
                              {...restColumnProps}
                              scope="col"
                              className="table-th"
                            >
                              {column.render("Header")}
                              <span>
                                {column.isSorted
                                  ? column.isSortedDesc
                                    ? " 🔽"
                                    : " 🔼"
                                  : ""}
                              </span>
                            </th>
                          );
                        })}
                      </tr>
                    );
                  })}
                </thead>
                <tbody
                  className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700!"
                  {...getTableBodyProps()}
                >
                  {loading ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="table-td py-4">
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                      </td>
                    </tr>
                  ) : page.length === 0 ? (
                    <tr>
                      <td
                        colSpan={COLUMNS.length}
                        className="table-td py-4 text-center text-slate-500 dark:text-slate-400"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    page.map((row) => {
                      prepareRow(row);
                      const { key: rowKey, ...restRowProps } = row.getRowProps();
                      return (
                        <tr key={rowKey} {...restRowProps}>
                          {row.cells.map((cell) => {
                            const { key: cellKey, ...restCellProps } =
                              cell.getCellProps();
                            return (
                              <td
                                key={cellKey}
                                {...restCellProps}
                                className="table-td py-2"
                              >
                                {cell.render("Cell")}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {pageOptions.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Page{" "}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={previousPage}
                disabled={!canPreviousPage}
                className="px-3 py-1 text-sm rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={nextPage}
                disabled={!canNextPage}
                className="px-3 py-1 text-sm rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default TransactionsTable;
