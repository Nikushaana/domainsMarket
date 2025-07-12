"use client";

import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { TypeAnimation } from "react-type-animation";
import { TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import ScanIcon from "@mui/icons-material/Flip";
import Card1 from "./components/cards/card1";
import { axiosFront, axiosUser } from "./components/data/axios";
import CustPagination from "./components/pagination/custPagination";
import { userProviderContext } from "./components/data/user/userContext";

export default function page() {
  const { userData } = useContext(userProviderContext);
  const [domainsData, setDomainsData] = useState<DomainResponse>({
    currentPage: 1,
    data: [],
    limit: 9,
    totalItems: 0,
    totalPages: 0,
  });
  const [domainsRender, setDomainsRender] = useState<number>(1);

  useEffect(() => {
    axiosFront
      .get(`front/domains?page=${domainsData.currentPage}&limit=9`)
      .then(({ data }) => {
        setDomainsData(data);
      })
      .catch((error) => {
        console.error("Failed to fetch domains:", error);
      });
  }, [domainsRender, domainsData.currentPage]);

  const [addDomainLoader, setAddDomainLoader] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setInputError("");
  };

  const domainSchema = Yup.string()
    .required("Domain is required")
    .max(20)
    .matches(
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/,
      "Please enter a valid domain name (e.g. example.com)"
    );

  const handleAddDomain = () => {
    setAddDomainLoader(true);

    try {
      domainSchema.validateSync(inputValue);
      axiosUser
        .post(`front/domains`, { name: inputValue })
        .then((res) => {
          setDomainsRender((prev) => prev + 1);
          {
            !("id" in userData) &&
              toast.success(
                `Your domain ${inputValue} was submitted for review.`,
                {
                  autoClose: 3000,
                }
              );
          }
          setInputValue("");
        })
        .catch((error) => {
          toast.error("Domain wasn't uploaded! Please try again.", {
            autoClose: 3000,
          });
        })
        .finally(() => {
          setAddDomainLoader(false);
        });
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        toast.error(validationError.message, {
          autoClose: 3000,
        });
        setInputError(validationError.message);
      } else {
        toast.error("Unexpected validation error", { autoClose: 3000 });
      }
      setAddDomainLoader(false);
    }
  };

  return (
    <div className="mt-[-100px] pb-[100px] flex flex-col gap-[120px] overflow-hidden">
      <div className="bg-myPurple px-[100px] max-lg:px-[50px] max-sm:px-[16px] pt-[100px] h-[50vh] max-sm:h-[70vh] flex items-center relative">
        <div className="flex flex-col gap-y-[50px] w-full z-[2]">
          <TypeAnimation
            sequence={[
              "These adds information about a domain",
              3000,
              "Add the domain, what are you waiting for? :)",
              4000,
            ]}
            speed={80}
            wrapper="h1"
            className="text-[35px] text-white max-lg:h-[100px] max-sm:h-[150px]"
            cursor={true}
            repeat={Infinity}
          />

          <div className="flex max-sm:flex-col items-center self-start gap-[20px] w-[60%] max-lg:w-full">
            <TextField
              label="Domain"
              placeholder="Write any domain you want"
              variant="outlined"
              value={inputValue}
              onChange={handleChange}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& fieldset": {
                    borderColor: `${inputError ? "red" : "black"}`,
                  },
                  "&:hover fieldset": {
                    borderColor: "#342f2f",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#bab6b6",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#afafaf",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#d5d5d5",
                },
                "& .MuiInputBase-input": {
                  color: "white",
                },
              }}
            />
            <LoadingButton
              onClick={handleAddDomain}
              endIcon={<ScanIcon />}
              loading={addDomainLoader}
              loadingPosition="end"
              variant="contained"
              sx={{
                borderRadius: "10px",
                height: "60px",
                width: "200px",
                fontSize: "20px",
                backgroundColor: "#4CAF50",
                "&:hover": {
                  backgroundColor: "#45A049",
                },
              }}
            >
              Add
            </LoadingButton>
          </div>
        </div>

        <div className="z-[1] w-[100vw] aspect-square rounded-[40%] animate-spin bg-myPurple absolute bottom-[-20px] left-[-40vw] pointer-events-none select-none"></div>
        <div className="z-[1] w-[100vw] aspect-square rounded-[40%] animate-spin1 bg-myPurple absolute bottom-[-30px] left-[-10vw] pointer-events-none select-none"></div>
        <div className="z-[1] w-[100vw] aspect-square rounded-[40%] animate-spin2 bg-myPurple absolute bottom-[-50px] right-[-10vw] pointer-events-none select-none"></div>
        <div className="z-[1] w-[100vw] aspect-square rounded-[40%] animate-spin bg-myPurple absolute bottom-[-20px] right-[-40vw] pointer-events-none select-none"></div>
      </div>

      <div className="px-[100px] max-lg:px-[50px] max-sm:px-[16px] flex flex-col gap-y-[20px]">
        <h1 className="text-[25px]">Added Domains</h1>
        {domainsData.totalItems > 0 && (
          <p className="text-[13px] text-gray-600">
            The number of domains is{" "}
            <span className="text-[16px] text-black">
              {domainsData.totalItems}
            </span>
          </p>
        )}

        {domainsData.totalItems > 0 ? (
          <>
            {domainsData.totalItems > 9 && (
              <div className="self-end">
                <CustPagination
                  totalPages={domainsData.totalPages}
                  currentPage={domainsData.currentPage}
                  setCurrentPage={setDomainsData}
                />
              </div>
            )}
            {domainsData?.data?.map((item: Domain, index: number) => (
              <Card1 key={item.id} item={item} />
            ))}
            {domainsData.totalItems > 9 && (
              <div className="self-end">
                <CustPagination
                  totalPages={domainsData.totalPages}
                  currentPage={domainsData.currentPage}
                  setCurrentPage={setDomainsData}
                />
              </div>
            )}
          </>
        ) : (
          <p>You don't have any added domain yet..</p>
        )}
      </div>
    </div>
  );
}
