import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

export const ExerciseType = {
  OTHER_WORKOUT: 0,
  BIKING: 8,
  BIKING_STATIONARY: 9,
  RUNNING: 56,
  RUNNING_TREADMILL: 57,
  WALKING: 79,
} as const;

export type ExerciseType = (typeof ExerciseType)[keyof typeof ExerciseType];

export function getNameFromExerciseType(num: ExerciseType): string {
  const entries = Object.entries(ExerciseType);
  for (const [key, value] of entries) {
    if (value === num) {
      return key
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    }
  }
  return "Unknown Exercise";
}

export function getIconFromExerciseType(num: ExerciseType) {
  switch (num) {
    case ExerciseType.BIKING:
    case ExerciseType.BIKING_STATIONARY:
      return DirectionsBikeIcon;
    case ExerciseType.RUNNING:
    case ExerciseType.RUNNING_TREADMILL:
      return DirectionsRunIcon;
    case ExerciseType.WALKING:
      return DirectionsWalkIcon;
    default:
      return FitnessCenterIcon;
  }
}
