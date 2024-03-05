import { FunctionComponent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ErrorMessage, Field, FieldArray, Formik } from "formik";
import { useMutation } from "react-query";

import { fetch, FetchError, FetchResponse } from "../../utils/dataAccess";
import { Review } from "../../types/Review";

interface Props {
  review?: Review;
}

interface SaveParams {
  values: Review;
}

interface DeleteParams {
  id: string;
}

const saveReview = async ({ values }: SaveParams) =>
  await fetch<Review>(!values["@id"] ? "/reviews" : values["@id"], {
    method: !values["@id"] ? "POST" : "PUT",
    body: JSON.stringify(values),
  });

const deleteReview = async (id: string) =>
  await fetch<Review>(id, { method: "DELETE" });

export const Form: FunctionComponent<Props> = ({ review }) => {
  const [, setError] = useState<string | null>(null);
  const router = useRouter();

  const saveMutation = useMutation<
    FetchResponse<Review> | undefined,
    Error | FetchError,
    SaveParams
  >((saveParams) => saveReview(saveParams));

  const deleteMutation = useMutation<
    FetchResponse<Review> | undefined,
    Error | FetchError,
    DeleteParams
  >(({ id }) => deleteReview(id), {
    onSuccess: () => {
      router.push("/reviews");
    },
    onError: (error) => {
      setError(`Error when deleting the resource: ${error}`);
      console.error(error);
    },
  });

  const handleDelete = () => {
    if (!review || !review["@id"]) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    deleteMutation.mutate({ id: review["@id"] });
  };

  return (
    <div className="container mx-auto px-4 max-w-2xl mt-4">
      <Link
        href="/reviews"
        className="text-sm text-cyan-500 font-bold hover:text-cyan-700"
      >
        {`< Back to list`}
      </Link>
      <h1 className="text-3xl my-2">
        {review ? `Edit Review ${review["@id"]}` : `Create Review`}
      </h1>
      <Formik
        initialValues={
          review
            ? {
                ...review,
              }
            : new Review()
        }
        validate={() => {
          const errors = {};
          // add your validation logic here
          return errors;
        }}
        onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
          const isCreation = !values["@id"];
          saveMutation.mutate(
            { values },
            {
              onSuccess: () => {
                setStatus({
                  isValid: true,
                  msg: `Element ${isCreation ? "created" : "updated"}.`,
                });
                router.push("/reviews");
              },
              onError: (error) => {
                setStatus({
                  isValid: false,
                  msg: `${error.message}`,
                });
                if ("fields" in error) {
                  setErrors(error.fields);
                }
              },
              onSettled: () => {
                setSubmitting(false);
              },
            }
          );
        }}
      >
        {({
          values,
          status,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form className="shadow-md p-4" onSubmit={handleSubmit}>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="review_rating"
              >
                rating
              </label>
              <input
                name="rating"
                id="review_rating"
                value={values.rating ?? ""}
                type="number"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.rating && touched.rating ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.rating && touched.rating ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="rating"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="review_body"
              >
                body
              </label>
              <input
                name="body"
                id="review_body"
                value={values.body ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.body && touched.body ? "border-red-500" : ""
                }`}
                aria-invalid={errors.body && touched.body ? "true" : undefined}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="body"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="review_author"
              >
                author
              </label>
              <input
                name="author"
                id="review_author"
                value={values.author ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.author && touched.author ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.author && touched.author ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="author"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="review_publicationDate"
              >
                publicationDate
              </label>
              <input
                name="publicationDate"
                id="review_publicationDate"
                value={values.publicationDate?.toLocaleString() ?? ""}
                type="dateTime"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.publicationDate && touched.publicationDate
                    ? "border-red-500"
                    : ""
                }`}
                aria-invalid={
                  errors.publicationDate && touched.publicationDate
                    ? "true"
                    : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="publicationDate"
              />
            </div>
            <div className="mb-2">
              <div className="text-gray-700 block text-sm font-bold">book</div>
              <FieldArray
                name="book"
                render={(arrayHelpers) => (
                  <div className="mb-2" id="review_book">
                    {values.book && values.book.length > 0 ? (
                      values.book.map((item: any, index: number) => (
                        <div key={index}>
                          <Field name={`book.${index}`} />
                          <button
                            type="button"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => arrayHelpers.insert(index, "")}
                          >
                            +
                          </button>
                        </div>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => arrayHelpers.push("")}
                      >
                        Add
                      </button>
                    )}
                  </div>
                )}
              />
            </div>
            {status && status.msg && (
              <div
                className={`border px-4 py-3 my-4 rounded ${
                  status.isValid
                    ? "text-cyan-700 border-cyan-500 bg-cyan-200/50"
                    : "text-red-700 border-red-400 bg-red-100"
                }`}
                role="alert"
              >
                {status.msg}
              </div>
            )}
            <button
              type="submit"
              className="inline-block mt-2 bg-cyan-500 hover:bg-cyan-700 text-sm text-white font-bold py-2 px-4 rounded"
              disabled={isSubmitting}
            >
              Submit
            </button>
          </form>
        )}
      </Formik>
      <div className="flex space-x-2 mt-4 justify-end">
        {review && (
          <button
            className="inline-block mt-2 border-2 border-red-400 hover:border-red-700 hover:text-red-700 text-sm text-red-400 font-bold py-2 px-4 rounded"
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
