import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FieldArrayWithId,
  useFieldArray,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";
import { Button } from "./ui/button";
import { LucideX } from "lucide-react";
import Item from "./Item";

export default function PersonInfo({
  person,
  personIndex,
  form,
  removePerson,
}: {
  person: FieldArrayWithId<
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
    "infos",
    "id"
  >;
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
  removePerson: UseFieldArrayRemove;
}) {
  const {
    fields: itemFields,
    append: addItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: `infos.${personIndex}.items`,
  });
  const watchedItems = form.watch(`infos.${personIndex}.items`);
  const totalPrice = watchedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className={`${personIndex !== 0 && "mt-8"} `} key={person.id}>
      <div className="flex items-center justify-between">
        <FormField
          control={form.control}
          name={`infos.${personIndex}.username`}
          render={({ field }) => (
            <FormControl>
              <Input
                className=" shadow-none outline-0 border-0 max-w-3xs"
                {...field}
              />
            </FormControl>
          )}
        />
        {personIndex !== 0 && (
          <Button variant="ghost" onClick={() => removePerson(personIndex)}>
            <LucideX className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Card className="mt-2 overflow-hidden ">
        <CardContent className="space-y-2 p-4">
          {itemFields.map((item, itemIndex) => (
            <Item
              key={itemIndex}
              item={item}
              personIndex={personIndex}
              itemIndex={itemIndex}
              form={form}
              removeItem={removeItem}
            />
          ))}
          <div className="grid grid-cols-12 mt-8 ">
            <Button
              onClick={() =>
                addItem({
                  itemName: "",
                  price: 0,
                  quantity: 1,
                })
              }
              className="col-span-12 lg:col-span-4 col-start-1 "
              type="button"
              variant={"ghost"}
            >
              + Add Item
            </Button>
            <div className="mt-6 lg:mt-0 col-span-5 flex items-center lg:justify-end ">
              <p>Total</p>
            </div>
            <div className="mt-6 lg:mt-0 ml-4 col-span-6 lg:col-span-3 col-end-[-1] flex justify-end lg:justify-start items-center">
              <p className="ml-4  text-xl ">RM {totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
