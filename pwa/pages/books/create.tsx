import { NextComponentType, NextPageContext } from "next";
import Head from "next/head";

import { Form } from "../../components/book/Form";

const Page: NextComponentType<NextPageContext> = () => (
  <div>
    <div>
      <Head>
        <title>Create New Book</title>
      </Head>
    </div>
    <Form />
  </div>
);

export default Page;
