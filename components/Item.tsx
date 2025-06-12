import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LucideX } from "lucide-react";
import {
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";

export default function Item({
  item,
  itemIndex,
  personIndex,
  form,
  removeItem,
}: {
  item: FieldArrayWithId<
    {
      infos: {
        items: {
          itemName?: string;
          price: number;
          quantity: number;
        }[];
        username: string;
      }[];
    },
    `infos.${number}.items`,
    "id"
  >;
  itemIndex: number;
  personIndex: number;
  form: UseFormReturn<
    {
      infos: {
        items: {
          itemName?: string;
          price: number;
          quantity: number;
        }[];
        username: string;
      }[];
    },
    any,
    {
      infos: {
        items: {
          itemName?: string;
          price: number;
          quantity: number;
        }[];
        username: string;
      }[];
    }
  >;
  removeItem: UseFieldArrayRemove;
}) {
  const watchedPrice =
    form.watch(`infos.${personIndex}.items.${itemIndex}.price`) ?? 0;
  const watchedQty =
    form.watch(`infos.${personIndex}.items.${itemIndex}.quantity`) ?? 0;
  const itemTotal = watchedPrice * watchedQty ? watchedPrice * watchedQty : 0;
  return (
    <div
      key={item.itemName}
      className={`relative grid grid-cols-12 gap-2 ${
        itemIndex !== 0 && "mt-12 lg:mt-4"
      }`}
    >
      <div className="absolute -right-3 -top-[10px] z-20 lg:hidden">
        {itemIndex !== 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => removeItem(itemIndex)}
          >
            <LucideX className="h-4 w-4" />
          </Button>
        )}
      </div>

      <FormField
        control={form.control}
        name={`infos.${personIndex}.items.${itemIndex}.itemName`}
        render={({ field }) => (
          <FormItem className="col-span-12 lg:col-span-4">
            <FormLabel>Item Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`infos.${personIndex}.items.${itemIndex}.price`}
        render={({ field }) => (
          <FormItem className="col-span-8 lg:col-span-3">
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...field}
                value={field.value === 0 ? "" : field.value} // allows clearing
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : parseFloat(e.target.value)
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`infos.${personIndex}.items.${itemIndex}.quantity`}
        render={({ field }) => (
          <FormItem className="col-span-4 lg:col-span-2">
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : parseFloat(e.target.value)
                  )
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      <div className=" col-span-12 lg:col-span-3 px-2 flex items-baseline-last justify-end lg:justify-between">
        <p className="lg:ml-4  text-md lg:text-xl">RM {itemTotal.toFixed(2)}</p>
        <div className="hidden lg:block">
          {itemIndex !== 0 && (
            <Button
              type="button"
              variant="ghost"
              className=" lg:block"
              onClick={() => removeItem(itemIndex)}
            >
              <LucideX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
