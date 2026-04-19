import type { JSX } from "../../src/lib";

export const Title = ({ children }: { children: JSX.Node }) => {
    return (
        <h>
            {children}
        </h>
    );
};
