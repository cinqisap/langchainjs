import { OpenAIEmbeddings } from "@langchain/openai";
import hanaClient from "hdb";
import { Document } from "@langchain/core/documents";
import {
  HanaDB,
  HanaDBArgs,
} from "@langchain/community/vectorstores/hanavector";

const connectionParams = {
  host: process.env.HANA_HOST,
  port: process.env.HANA_PORT,
  user: process.env.HANA_UID,
  password: process.env.HANA_PWD,
};
const client = hanaClient.createClient(connectionParams);

// Connect to SAP HANA
await new Promise<void>((resolve, reject) => {
  client.connect((err: Error) => {
    if (err) {
      reject(err);
    } else {
      console.log("Connected to SAP HANA successfully.");
      resolve();
    }
  });
});

const docs: Document[] = [
    {
      pageContent: "First",
      metadata: { start: 1, end: 10, docName: "adam.txt", quality: "active" },
    },
    {
      pageContent: "Second",
      metadata: { start: 2, end: 5.7, docName: "bob.txt", quality: "inactive" },
    },
    {
      pageContent: "Third",
      metadata: { start: 3, end: 2.4, docName: "jane.txt", quality: "active" },
    },
  ];
  

// Initialize embeddings
const embeddings = new OpenAIEmbeddings();

const args: HanaDBArgs = {
    connection: client,
    tableName: "testAdvancedFilters",
  };

// Create a LangChain VectorStore interface for the HANA database and specify the table (collection) to use in args.
const vectorStore = new HanaDB(embeddings, args);
// need to initialize once an instance is created.
await vectorStore.initialize();
// Delete already existing documents from the table
await vectorStore.delete({ filter: {} });
await vectorStore.addDocuments(docs);

// Helper function to print filter results
function printFilterResult(result: Document[]) {
    if (result.length === 0) {
      console.log("<empty result>");
    } else {
      result.forEach(doc => console.log(doc.metadata));
    }
  }

  let advancedFilter;

  // Not equal
  advancedFilter = { id: { $ne: 1 } };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  // Between range
  advancedFilter = { id: { $between: [1, 2] } };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  // In list
  advancedFilter = { name: { $in: ["adam", "bob"] } };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  // Not in list
  advancedFilter = { name: { $nin: ["adam", "bob"] } };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  // Greater than
  advancedFilter = { id: { $gt: 1 } };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  // Greater than or equal to
  advancedFilter = { id: { $gte: 1 } };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  // Less than
  advancedFilter = { id: { $lt: 1 } };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  // Less than or equal to
  advancedFilter = { id: { $lte: 1 } };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  // Text filtering with $like
  advancedFilter = { name: { $like: "a%" } };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  advancedFilter = { name: { $like: "%a%" } };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  // Combined filtering with $or
  advancedFilter = { $or: [{ id: 1 }, { name: "bob" }] };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  // Combined filtering with $and
  advancedFilter = { $and: [{ id: 1 }, { id: 2 }] };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

  advancedFilter = { $or: [{ id: 1 }, { id: 2 }, { id: 3 }] };
  console.log(`Filter: ${JSON.stringify(advancedFilter)}`);
  printFilterResult(await vectorStore.similaritySearch("just testing", 5, advancedFilter));

// Disconnect from SAP HANA after the operations
client.disconnect();
