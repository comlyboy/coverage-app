import { useEffect } from "react";

import { useCoverageStore } from "../stores/coverage.store";
import CoverageCard from "../components/CoverageCard";


export default function CoveragePage() {

	const { coverages } = useCoverageStore();

	useEffect(() => {

	}, [])


	return <div>
		{coverages.map(coverage => <CoverageCard coverage={coverage} />)}
	</div>

}