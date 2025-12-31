import PivotTable from "../form-elements/PivotTable";


function SelectInputs() {
  return (
    <div>
      <PivotTable
        selectedRows={[]}
        selectedCols={[]}
        selectedValues={[]}
        selectedAggregation={"Sum"}
      />
    </div>
  )
}

export default SelectInputs;