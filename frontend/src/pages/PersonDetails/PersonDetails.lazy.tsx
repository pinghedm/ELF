import React, { lazy, Suspense } from "react";
import { PersonDetailsProps } from "./PersonDetails";
const LazyPersonDetails = lazy(() => import("./PersonDetails"));

const PersonDetails = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & PersonDetailsProps,
) => (
    <Suspense fallback={null}>
        <LazyPersonDetails {...props} />
    </Suspense>
);

export default PersonDetails;
