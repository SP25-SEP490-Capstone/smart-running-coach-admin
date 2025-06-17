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
import "./UDPRecordsSection.scss";

interface UDPRecordSectionProps {
  loading: boolean;
  onViewRecord: (record: string) => void;
}

export default function UDPRecordsSection({
  loading,
  onViewRecord,
}: UDPRecordSectionProps) {
  const records = [
    {
      name: "Exercise Session",
      icon: <ExerciseIcon className="record-icon" />,
      highlight: true,
    },
  ];

  return (
    <div className="udp-records-section">
      <p className="label">Health Records</p>
      <div className="records-grid">
        {records.map((record) => (
          <Button
            key={record.name}
            variant={record.highlight ? "contained" : "outlined"}
            className={`record-button ${record.highlight ? "highlight" : ""}`}
            onClick={() => onViewRecord(record.name)}
            disabled={loading}
            startIcon={record.icon}
          >
            {record.name}
          </Button>
        ))}
      </div>
    </div>
  );
}