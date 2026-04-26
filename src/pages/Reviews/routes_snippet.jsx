import Reviews, { ReviewDetail } from "./pages/Reviews/Reviews";

<Route path="/reviews" element={<Reviews />} />
<Route path="/reviews/:slug" element={<ReviewDetail />} />
