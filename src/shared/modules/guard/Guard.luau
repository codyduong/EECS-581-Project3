export type Check<T> = (Value: unknown) -> T

local function Record(record: { [any]: Check<any> }): Check<{ [any]: any }>
	return function(Value)
		assert(type(Value) == "table", "Expected a table")

		for key, checkValue in record do
			local foundValue = Value[key]
			assert(foundValue ~= nil, string.format("Missing required key: %s", tostring(key)))

			checkValue(foundValue)
		end

		for key in pairs(Value) do
			assert(pairs[key], string.format("Unexpected key found: %s", tostring(key)))
		end

		return Value
	end
end

local function Tuple(...): Check<{ any }>
	local args = { ... }

	local checks = (#args == 1 and type(args[1]) == "table") and args[1] or args

	return function(Value)
		assert(type(Value) == "table", "Expected a table")
		assert(#Value == #checks, "Tuple length mismatch")

		for i, check in ipairs(checks) do
			check(Value[i])
		end

		return Value
	end
end

local base = require(game:GetService("ReplicatedStorage")["Packages"]["Guard"])

base["Record"] = Record;
base["Tuple"] = Tuple;

return {
  default = base
}