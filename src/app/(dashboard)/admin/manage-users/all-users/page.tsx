"use client";
import ActionBar from "@/components/ui/ActionBar";
import UMBreadCrumb from "@/components/ui/UMBreadCrumb";
import { Button, Dropdown, Input, Menu, Space, message } from "antd";
import Link from "next/link";
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useDebounced } from "@/redux/hooks";
import UMTable from "@/components/ui/UMTable";

import dayjs from "dayjs";
import UMModal from "@/components/ui/UMModal";
import {
  Error_model_hook,
  Success_model,
  confirm_modal,
} from "@/utils/modalHook";

import { USER_ROLE } from "@/constants/role";
import LoadingForDataFetch from "@/components/Utlis/LoadingForDataFetch";
import {
  useDeleteStudentMutation,
  useGetAllStudentsQuery,
} from "@/redux/api/adminApi/studentApi";
import { getUserInfo } from "@/services/auth.service";
import ModalComponent from "@/components/Modal/ModalComponents";
import CreateStudentComponent from "@/components/student/addStudentByAuthor/addStudentComponent";
import { ENUM_STATUS, ENUM_YN } from "@/constants/globalEnums";
import Image from "next/image";
import { AllImage } from "@/assets/AllImge";
// import SellerAddPackageStudent from "../package/SellerAddPackageStudent";
import {
  useGetAllUsersQuery,
  useUpdateUserMutation,
} from "@/redux/api/adminApi/usersApi";
import StatusTag from "@/components/ui/CustomTag/StatusTag";
// import SellerDeactivedStudentPackage from "../package/SellerDeactiveStudentPackage";

const StudentListCom = ({
  setOpen,
  author,
}: {
  setOpen: any;
  author?: string | undefined;
}) => {
  // const SUPER_ADMIN = USER_ROLE.ADMIN;
  const userInfo = getUserInfo() as any;
  const query: Record<string, any> = {};
  const [updateStudent, { isLoading: updateUserLoading }] =
    useUpdateUserMutation();

  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  query["limit"] = size;
  query["page"] = page;
  query["sortBy"] = sortBy;
  query["sortOrder"] = sortOrder;
  query["sortOrder"] = sortOrder;
  // query["status"] = ENUM_STATUS.ACTIVE;
  query["isDelete"] = ENUM_YN.NO;
  if (author) {
    query["author"] = author;
  }

  const debouncedSearchTerm = useDebounced({
    searchQuery: searchTerm,
    delay: 600,
  });

  if (!!debouncedSearchTerm) {
    query["searchTerm"] = debouncedSearchTerm;
  }
  const { data, isLoading } = useGetAllUsersQuery({
    ...query,
  });

  //@ts-ignore
  const StudentData = data?.data;

  //@ts-ignore
  const meta = data?.meta;

  const columns = [
    {
      width: 150,
      render: function (data: any) {
        // console.log(data);
        let img = `${data[data.role]?.img} `;
        if (img === "undefined" || img === "undefined ") {
          img = "";
        }

        return (
          <>
            <Image
              src={img || AllImage.notFoundImage}
              alt=""
              width={500}
              height={500}
              className="w-16 h-16 rounded-full"
            />
          </>
        );
      },
    },
    {
      title: "Name",
      render: function (data: any) {
        let fullName = "";
        if (data?.role === USER_ROLE.ADMIN) {
          fullName = data?.admin?.name?.firstName + " " + data?.admin?.name?.lastName;
        } else if (data?.role === USER_ROLE.TRAINER) {
          fullName =
            data?.trainer?.name?.firstName + " " + data?.trainer?.name?.lastName;
        } else if (data?.role === USER_ROLE.SELLER) {
          fullName =
            data?.seller?.name?.firstName + " " + data?.seller?.name?.lastName;
        } else if (data?.role === USER_ROLE.STUDENT) {
          fullName =
            data?.student?.name?.firstName + " " + data?.student?.name?.lastName;
        }
        return <p className="">{fullName}</p>;
      },
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      width: 100,
      render: function (data: any) {
        const role = data?.role;
        return <>{role}</>;
      },
    },

    {
      title: "Contact no.",
      // dataIndex: "phoneNumber",
      render: function (data: any) {
        let Contact = "";
        if (data?.role === USER_ROLE.ADMIN) {
          Contact = data?.admin?.phoneNumber;
        } else if (data?.role === USER_ROLE.TRAINER) {
          Contact = data?.trainer?.phoneNumber;
        } else if (data?.role === USER_ROLE.SELLER) {
          Contact = data?.seller?.phoneNumber;
        } else if (data?.role === USER_ROLE.STUDENT) {
          Contact = data?.student?.phoneNumber;
        }
        return <>{Contact}</>;
      },
    },
    // {
    //   title: "Date Of Birth",
    //   // dataIndex: "dateOfBirth",
    //   render: function (data: any) {
    //     // console.log(data);
    //     const date = `${data[data.role]?.dateOfBirth}   `;
    //     return date && dayjs(date).format("MMMM D, YYYY");
    //   },

    // },
    {
      title: "Created at",
      dataIndex: "createdAt",
      render: function (data: any) {
        return data && dayjs(data).format("MMM D, YYYY hh:mm A");
      },
      sorter: true,
    },
    {
      title: "Status",
      width: 100,
      render: function (data: any) {
        const status = data?.status;
        return <StatusTag status={status} />;
      },
    },
    {
      title: "Action",
      dataIndex: "_id",
      width: 130,
      render: function (id: string, data: any) {
        return (
          <>
            <Space size="middle">
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="details">
                      <Link href={`/${userInfo?.role}/manage-users/all-users/details/${id}`}>
                        View
                      </Link>
                    </Menu.Item>
                    <Menu.Item key="edit">
                      <Link href={`/${userInfo?.role}/manage-users/all-users/edit/${id}`}>
                        Edit
                      </Link>
                    </Menu.Item>

                    <Menu.Item
                      key="delete"
                      onClick={() => {
                        handleDeactivate(id, data);
                      }}
                    >
                      {data.status === ENUM_STATUS.ACTIVE
                        ? "Deactivate"
                        : "Active"}{" "}
                      User
                    </Menu.Item>
                    {/* <ModalComponent buttonText="Add package">
                      <SellerAddPackageStudent userId={id} />
                    </ModalComponent>
                    <p className="mt-1"></p>

                    <ModalComponent buttonText="Package List">
                      <SellerDeactivedStudentPackage userId={id} />
                    </ModalComponent> */}
                  </Menu>
                }
              >
                <button className="text-blue-700">Action</button>
              </Dropdown>
            </Space>
          </>
        );
      },
    },
  ];
  const onPaginationChange = (page: number, pageSize: number) => {
    //  // console.log("Page:", page, "PageSize:", pageSize);
    setPage(page);
    setSize(pageSize);
  };
  const onTableChange = (pagination: any, filter: any, sorter: any) => {
    const { order, field } = sorter;
    // console.log(order, field);
    setSortBy(field as string);
    setSortOrder(order === "ascend" ? "asc" : "desc");
  };

  const resetFilters = () => {
    setSortBy("");
    setSortOrder("");
    setSearchTerm("");
  };

  const handleDeactivate = async (id: string, data: any) => {
    console.log(id);
    confirm_modal(`Are you sure you want to Update status`, "Yes").then(
      async (res) => {
        if (res.isConfirmed) {
          try {
            const res = await updateStudent({
              id: id,
              body: {
                status:
                  data?.status === ENUM_STATUS.ACTIVE
                    ? ENUM_STATUS.DEACTIVATE
                    : ENUM_STATUS.ACTIVE,
              },
            }).unwrap();
            if (res?.success == false) {
              // message.success("Admin Successfully Deleted!");
              Error_model_hook(res?.message);
            } else {
              setOpen(false);
              Success_model("Successfully Update Account status");
            }
          } catch (error: any) {
            Error_model_hook(error.message);
          }
        }
      }
    );
  };
  // if (isLoading) {
  //   return <LoadingForDataFetch />;
  // }
  return (
    <div
      style={{
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        borderRadius: "1rem",
        backgroundColor: "white",
        padding: "1rem",
      }}
    >
      <ActionBar title="Student List">
        <Input
          size="large"
          placeholder="Search"
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "20%",
          }}
        />
        <div>
          {/* <Link href={`/${userInfo?.role}/manage-users/students/create`}>
            <Button type="default">Create Student</Button>
          </Link> */}
          <ModalComponent buttonText="Create Student">
            <CreateStudentComponent />
          </ModalComponent>
          {(!!sortBy || !!sortOrder || !!searchTerm) && (
            <Button
              style={{ margin: "0px 5px" }}
              type="default"
              onClick={resetFilters}
            >
              <ReloadOutlined />
            </Button>
          )}
        </div>
      </ActionBar>

      <UMTable
        loading={isLoading}
        columns={columns}
        dataSource={StudentData}
        pageSize={size}
        totalPages={meta?.total}
        showSizeChanger={true}
        onPaginationChange={onPaginationChange}
        onTableChange={onTableChange}
        showPagination={true}
      />
    </div>
  );
};

export default StudentListCom;
