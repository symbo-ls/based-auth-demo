import { render } from "react-dom";
import React, { useState } from "react";
import {
  Provider,
  Authorize,
  Topbar,
  LoadingIcon,
  Text,
  useContextMenu,
  StackedListItemsWrapper,
  StackedListItem,
  Avatar,
  UserProfile,
  Button,
  AddIcon,
  EditIcon,
  useSelect,
  Input,
  CheckIcon,
} from "@based/ui";
import based from "@based/client";
import { useClient, useData } from "@based/react";
import { prettyDate } from "@based/pretty-date";

export const client = based({
  org: "saulx",
  project: "demo",
  env: "production",
});

const Todo = ({ id, name, description, createdAt, done }) => {
  const client = useClient();
  return (
    <StackedListItem>
      <Avatar
        size={40}
        icon={done ? CheckIcon({ size: 16 }) : EditIcon({ size: 16 })}
        color={done ? "Green" : "BlueSailor"}
        onClick={() => {
          client.set({ $id: id, done: !done });
        }}
      />
      <div>
        <Input
          value={name}
          ghost
          onChange={(name) => {
            client.set({ $id: id, name });
          }}
          type="text"
        />
        {/* <Text weight={600}>{name}</Text> */}
        <Text color="TextSecondary">{description}</Text>
        <Text>{prettyDate(createdAt, "date-time")}</Text>
      </div>
    </StackedListItem>
  );
};

const App = ({ user }: { user: { id: string; token: string } }) => {
  const client = useClient();
  const [value, open] = useSelect(["Todo", "All", "Completed"], "All");

  const filter: any[] = [
    {
      $field: "type",
      $operator: "=",
      $value: "todo",
    },
  ];

  if (value === "Completed" || value == "Todo") {
    filter.push({
      $field: "done",
      $operator: "=",
      $value: value === "Completed",
    });
  }

  const { data, loading } = useData({
    $id: user.id,
    todos: {
      id: true,
      done: true,
      name: true,
      createdAt: true,
      description: true,
      $list: {
        $sort: {
          $field: "createdAt",
          $order: "desc",
        },
        $limit: 100,
        $offset: 0,
        $find: {
          $traverse: "children",
          $filter: filter,
        },
      },
    },
  });

  return (
    <>
      <Topbar
        data={{ Projects: "/", Settings: "/settings" }}
        onProfile={useContextMenu(
          UserProfile,
          { id: user.id },
          { position: "right", offset: { x: 0, y: 28 } }
        )}
      />
      <div
        style={{
          padding: "32px 48px",
          height: "calc(100vh - 66px)",
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {loading ? (
          <LoadingIcon />
        ) : (
          <StackedListItemsWrapper
            topLeft={
              <>
                <Text color="PrimaryMain">Todos</Text>
                <Button ghost onClick={open}>
                  {value || "All"}
                </Button>
              </>
            }
            topRight={
              <>
                <Button
                  onClick={async () => {
                    await client.set({
                      type: "todo",
                      done: false,
                      name: "New todo",
                      parents: [user.id],
                    });
                  }}
                  iconLeft={AddIcon}
                  ghost
                >
                  Add Todo
                </Button>
              </>
            }
          >
            <div style={{}}>
              {data.todos?.map((t) => {
                return <Todo {...t} key={t.id} />;
              })}
            </div>
          </StackedListItemsWrapper>
        )}
      </div>
    </>
  );
};

render(
  <Provider theme="light" client={client}>
    <Authorize logo app={App} />
  </Provider>,
  document.body
);
