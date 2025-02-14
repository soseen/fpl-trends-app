import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";

export const usePlayersTable = () => {
  const { list } = useSelector((state: RootState) => state.footballers);
};
