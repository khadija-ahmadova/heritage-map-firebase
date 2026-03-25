import SplitMapLayout from "../components/layout/SplitMapLayout";

const SearchbyEraPage = () => {
    return (
        <SplitMapLayout>
            <h1 className="text-3xl font-bold mb-6">
                Search by Era
            </h1>

            {/* Filters */}
            <div className="mb-6">
                Era filter 
            </div>

            {/* Results */}
            <div className="space-y-4">
                building cards
            </div>
        </SplitMapLayout>
    )
}

export default SearchbyEraPage;