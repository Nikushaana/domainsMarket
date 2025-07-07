import React from "react";

interface CustPaginationProps<T extends { currentPage: number }> {
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<T>>;
}

export default function CustPagination<T extends { currentPage: number }>({
  totalPages,
  currentPage,
  setCurrentPage,
}: CustPaginationProps<T>) {
  return (
    <div className="flex items-center gap-[5px] ">
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .slice(
          currentPage - 3 < 0 ? 0 : currentPage - 3,
          currentPage + 2 > totalPages ? totalPages : currentPage + 2
        )
        .map((page: number) => (
          <div
            key={page}
            onClick={() => {
              setCurrentPage((prev) => ({
                ...prev,
                currentPage: page,
              }));
            }}
            className={`w-[40px] h-[40px] flex items-center justify-center text-[17px] rounded-full text-white cursor-pointer duration-200 ${
              currentPage == page ? "bg-myPurple " : "bg-myLightPurple "
            }`}
          >
            <h1>{page}</h1>
          </div>
        ))}
    </div>
  );
}
