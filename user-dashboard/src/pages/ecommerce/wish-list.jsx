import React from "react";
import Card from "@/components/ui/Card";

const Wishlist = () => {
  // Wishlist is populated from cart items the user saves. For now, render an
  // empty state — no bundled demo products are shown.
  return (
    <Card bodyClass="p-8">
      <div className="text-center py-16">
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
          Your wishlist is empty.
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
          Products you save will appear here.
        </p>
      </div>
    </Card>
  );
};

export default Wishlist;

