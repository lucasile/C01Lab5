const { MongoClient } = require("mongodb");

const SERVER_URL = "http://localhost:4000";

const mongoURL = "mongodb://127.0.0.1:27017";
const dbName = "quirknotes";

let connection;
let db;

const COLLECTIONS = {
  notes: "notes",
};

beforeAll(async () => {

  connection = await MongoClient.connect(mongoURL);

  db = await connection.db(dbName);

});

afterAll(async () => {
  await connection.close();
});

afterEach(async () => {
  // reset the db after each test. assume we are using a test db so it doesn't
  // impact actual notes
  const collection = db.collection(COLLECTIONS.notes);
  await collection.deleteMany({});
});

const postNoteDirectly = async (title, content) => {

  const createdAt = new Date();

  const collection = db.collection(COLLECTIONS.notes);

  const result = await collection.insertOne({
    title,
    content,
    createdAt,
  });

  return result.insertedId;

}

test("1+2=3, empty array is empty", () => {
  expect(1 + 2).toBe(3);
  expect([].length).toBe(0);
});

test("/postNote - Post a note", async () => {

  const title = "NoteTitleTest";
  const content = "NoteTitleContent";

  const postNoteRes = await fetch(`${SERVER_URL}/postNote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      content: content,
    }),
  });

  const postNoteBody = await postNoteRes.json();

  expect(postNoteRes.status).toBe(200);
  expect(postNoteBody.response).toBe("Note added succesfully.");
});

test("/getAllNotes - Return list of zero notes for getAllNotes", async () => {

  const notesRes = await fetch(`${SERVER_URL}/getAllNotes`, {
    method: "GET",
  });

  const json = await notesRes.json();

  expect(notesRes.status).toBe(200);
  expect(json.response.length).toBe(0);

});

test("/getAllNotes - Return list of two notes for getAllNotes", async () => {

  const title = "NoteTitleTest";
  const content = "NoteTitleContent";

  await postNoteDirectly(title, content);
  await postNoteDirectly(title, content);

  const notesRes = await fetch(`${SERVER_URL}/getAllNotes`, {
    method: "GET",
  });

  const json = await notesRes.json();

  expect(notesRes.status).toBe(200);
  expect(json.response.length).toBe(2);

});

test("/deleteNote - Delete a note", async () => {

  const title = "NoteTitleTest";
  const content = "NoteTitleContent";

  const id = await postNoteDirectly(title, content);

  const notesRes = await fetch(`${SERVER_URL}/deleteNote/${id}`, {
    method: "DELETE",
  });

  const json = await notesRes.json();

  expect(notesRes.status).toBe(200);
  expect(json.response).toBe(`Document with ID ${id} deleted.`);

});

test("/patchNote - Patch with content and title", async () => {

  let title = "NoteTitleTest";
  let content = "NoteTitleContent";

  const id = await postNoteDirectly(title, content);

  title = "NoteTitleTestPatched";
  content = "NoteTitleContentPatched";

  const patchNoteRes = await fetch(`${SERVER_URL}/patchNote/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      content: content,
    }),
  });

  const json = await patchNoteRes.json();

  expect(patchNoteRes.status).toBe(200);
  expect(json.response).toBe(`Document with ID ${id} patched.`);

});

test("/patchNote - Patch with just title", async () => {

  let title = "NoteTitleTest";
  let content = "NoteTitleContent";

  const id = await postNoteDirectly(title, content);

  title = "NoteTitleTestPatched";

  const patchNoteRes = await fetch(`${SERVER_URL}/patchNote/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
    }),
  });

  const json = await patchNoteRes.json();

  expect(patchNoteRes.status).toBe(200);
  expect(json.response).toBe(`Document with ID ${id} patched.`);

});

test("/patchNote - Patch with just content", async () => {

  let title = "NoteTitleTest";
  let content = "NoteTitleContent";

  const id = await postNoteDirectly(title, content);

  content = "NoteTitleContentPatched";

  const patchNoteRes = await fetch(`${SERVER_URL}/patchNote/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: content,
    }),
  });

  const json = await patchNoteRes.json();

  expect(patchNoteRes.status).toBe(200);
  expect(json.response).toBe(`Document with ID ${id} patched.`);

});

test("/deleteAllNotes - Delete one note", async () => {

  let title = "NoteTitleTest";
  let content = "NoteTitleContent";

  await postNoteDirectly(title, content);

  const notesRes = await fetch(`${SERVER_URL}/deleteAllNotes`, {
    method: "DELETE",
  });

  const json = await notesRes.json();

  expect(notesRes.status).toBe(200);
  expect(json.response).toBe("1 note(s) deleted.");

});

test("/deleteAllNotes - Delete three notes", async () => {

  let title = "NoteTitleTest";
  let content = "NoteTitleContent";

  await postNoteDirectly(title, content);
  await postNoteDirectly(title, content);
  await postNoteDirectly(title, content);

  const notesRes = await fetch(`${SERVER_URL}/deleteAllNotes`, {
    method: "DELETE",
  });

  const json = await notesRes.json();

  expect(notesRes.status).toBe(200);
  expect(json.response).toBe("3 note(s) deleted.");

});

test("/updateNoteColor - Update color of a note to red (#FF0000)", async () => {

  let title = "NoteTitleTest";
  let content = "NoteTitleContent";

  const id = await postNoteDirectly(title, content);

  const notesRes = await fetch(`${SERVER_URL}/updateNoteColor/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      color: "#FF0000",
    }),
  });

  const json = await notesRes.json();

  expect (notesRes.status).toBe(200);
  expect(json.message).toBe("Note color updated successfully.");

});
