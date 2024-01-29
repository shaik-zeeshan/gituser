#! /usr/bin/env bun

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { $, argv } from "bun";

const file_path = import.meta.dir + "/users.json";

type User = {
  type: string;
  email: string;
  username: string;
};

yargs(hideBin(process.argv))
  .command(
    "clone <url> <type> <args>",
    "clone a git repo with user config",
    (yargs) =>
      yargs
        .positional("url", { type: "string" })
        .positional("type", { type: "string" })
        .positional("args", { type: "string", default: "" }),
    async (argv) => {
      const userData = Bun.file(file_path);
      const users: User[] = JSON.parse(await userData.text());

      const user = users.find((user) => user.type === argv.type);

      if (!user) {
        console.log("User not found");
        return;
      }

      await $`git clone --config user.name=${user.username} --config user.email=${user.email} ${argv.url} ${argv.args}`;
    },
  )
  .command(
    "set <type>",
    "set a user in current dir",
    (yargs) =>
      yargs.positional("type", {
        type: "string",
      }),
    async (argv) => {
      const userData = Bun.file(file_path);
      const users: User[] = JSON.parse(await userData.text());

      const user = users.find((user) => user.type === argv.type);

      if (!user) {
        console.log("User not found");
        return;
      }

      await $`git config user.name ${user.username}`;
      await $`git config user.email ${user.email}`;
    },
  )
  .command(
    "new <user> <email> <type>",
    "create a git user config",
    (yargs) =>
      yargs
        .positional("user", { type: "string", required: true })
        .positional("email", { type: "string", required: true })
        .positional("type", { type: "string", required: true }),
    async (args) => {
      const userData = Bun.file(file_path);
      const users: User[] = JSON.parse(await userData.text());

      users.push({
        type: args.type!,
        email: args.email!,
        username: args.user!,
      });

      await Bun.write("users.json", JSON.stringify(users));
    },
  )
  .command(
    "ls",
    "Display all User configs",
    (yargs) => yargs,
    async () => {
      const userData = Bun.file("users.json", { type: "application/json" });
      const users: User[] = JSON.parse(await userData.text());

      console.table(users);
    },
  )
  .parse();
