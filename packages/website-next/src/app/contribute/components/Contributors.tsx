"use client";

import { useState, useEffect } from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface Contributor {
  name: string;
  url: string;
  avatar_url: string;
  admin: boolean;
}

export default function Contributors() {
  const [contributorList, setContributorList] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(
      "https://gitee.com/api/v5/repos/openinula/core/collaborators?page=1&per_page=100"
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to request contributor list");
        }
        return res.json();
      })
      .then((res) =>
        res
          .map(
            (item: {
              name: string;
              html_url: string;
              avatar_url: string;
              permissions: { admin: boolean };
            }) => ({
              name: item.name,
              url: item.html_url,
              avatar_url: item.avatar_url,
              admin: item.permissions.admin,
            })
          )
          .sort(
            (a: Contributor, b: Contributor) =>
              Number(b.admin) - Number(a.admin)
          )
      )
      .then((res) => {
        setContributorList(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-6">贡献者</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-6">贡献者</h2>
        <div className="text-center py-8 text-red-500">
          <p>加载贡献者列表失败</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
      <h2 className="text-2xl font-bold mb-6">贡献者</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {contributorList.map((item, index) => (
          <a
            className="group flex flex-col items-center p-4 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md"
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="mb-3">
              {item.avatar_url.includes("no_portrait") ? (
                <Avatar
                  style={{ backgroundColor: "#9cb1f1" }}
                  size={48}
                  icon={<UserOutlined />}
                />
              ) : (
                <Avatar
                  style={{ backgroundColor: "#9cb1f1" }}
                  size={48}
                  src={item.avatar_url}
                />
              )}
            </div>
            <p
              className="contributorName text-sm font-medium text-gray-900 dark:text-gray-100 text-center mb-1 truncate w-full"
              title={item.name}
            >
              {item.name}
            </p>
            <p className="contributorRoles text-xs text-gray-500 dark:text-gray-400">
              {item.admin ? "管理员" : "开发者"}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
