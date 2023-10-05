import Link from "next/link";
import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";

import TicketIcon from "@/assets/icons/ticket.svg?url";
import routes from "@/routes";

export default function Home() {
  return (
    <Wrapper className="mt-3">
      <div>
        <div className="flex flex-col md:flex-row">
          <Link
            href={routes.private.raffle}
            className="mt-4 bg-white shadow-md p-4 w-36 flex flex-col items-center rounded-xl hover:shadow-lg transition-shadow duration-300"
          >
            <Image src={TicketIcon} alt="Ticket icon" className="w-8" />
            <span className="text-sm text-gray">Criar Rifa</span>
          </Link>
        </div>
      </div>
    </Wrapper>
  );
}
