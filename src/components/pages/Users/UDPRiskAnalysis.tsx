import { Button } from "@mui/material";
import {
  DirectionsRun as ExerciseIcon,
  LocalFireDepartment as CaloriesIcon,
  Favorite as HeartRateIcon,
  DirectionsWalk as StepsIcon,
  Air as OxygenIcon,
  Bedtime as SleepIcon,
  Straighten as DistanceIcon,
  Timer as RestingHeartRateIcon,
  Whatshot as TotalCaloriesIcon,
} from "@mui/icons-material";
import "./UDPRiskAnalysis.scss";

interface UDPRecordSectionProps {
  loading: boolean;
  onViewRecord: (record: string) => void;
}

export default function UDPRiskAnalysis({
  loading,
  onViewRecord,
}: UDPRecordSectionProps) {
  return (
    <div className="udp-risk-analysis">
      <p className="label">Risk analysis</p>
      <div className="records-grid">
        <Button
          key={"Exercise Session"}
          variant={"contained"}
          className={`record-button highlight`}
          onClick={() => onViewRecord("Risk Analysis")}
          disabled={loading}
          startIcon={<HeartRateIcon />}
        >
          <p>View risk analysis list</p>
        </Button>
      </div>
    </div>
  );
}
