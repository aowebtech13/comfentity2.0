import React from "react";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { Link } from "react-router-dom";
import { MenuItem } from "@headlessui/react";
const notifyLabel = () => {
  return (
    <span className="relative ">
      
    </span>
  );
};

const Notification = () => {
  return (
    <Dropdown classMenuItems="md:w-[300px] top-[58px]" label={notifyLabel()}>
    
      
    </Dropdown>
  );
};

export default Notification;
