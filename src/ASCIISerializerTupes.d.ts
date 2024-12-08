export interface PartRangeData extends RangeData{
	size?: number,
	mustRemove?: boolean,
	repeats?: Array<RangeData>
}

export interface RangeData {
	start: number,
	length: number
	partIndex?: number
}
