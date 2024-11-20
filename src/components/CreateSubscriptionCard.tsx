"use client";
import { PlusCircle } from "lucide-react";
import type React from "react";

interface CreateSubscriptionProps {
  handleClick: () => void;
}

const CreateSubscriptionCard: React.FC<CreateSubscriptionProps> = ({
  handleClick,
}) => {
  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      <div className="text-gray-400 border-gray-800 border-2 border-dashed p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl group flex flex-col justify-center items-center h-full w-full transform hover:scale-105 hover:text-gray-300 hover:bg-gray-800 hover:bg-opacity-50">
        <PlusCircle className="h-14 w-14" />
      </div>
    </div>
  );
};

export default CreateSubscriptionCard;
