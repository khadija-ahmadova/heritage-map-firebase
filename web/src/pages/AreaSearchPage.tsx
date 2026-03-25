import SplitMapLayout from "../components/layout/SplitMapLayout";

const SearchByAreaPage = () => {
    return (
        <SplitMapLayout>
            <h1 className="text-3xl font-bold mb-6">
                Search by Area
            </h1>

            {/* Filters */}
            <div className="mb-6">
                architect filter 
            </div>

            {/* Results */}
            <div className="space-y-4">
                building cards
            </div>
        </SplitMapLayout>
    )
}

export default SearchByAreaPage;